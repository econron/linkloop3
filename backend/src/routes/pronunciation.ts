import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync } from 'fastify';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath as string);

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY!;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION!;

async function convertToWav(inputPath: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve(outputPath))
      .on('error', (err: any) => reject(err))
      .save(outputPath);
  });
}

const pronunciationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 発音評価のエンドポイント
  fastify.post<{
    Body: {
      audio: Buffer;
      referenceText: string;
    };
  }>('/pronunciation-assessment', {
    schema: {
      body: {
        type: 'object',
        required: ['audio', 'referenceText'],
        properties: {
          audio: { type: 'string', format: 'binary' },
          referenceText: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { audio, referenceText } = request.body;
      const tempDir = path.join(process.cwd(), 'uploads');
      const tempFile = path.join(tempDir, `temp_${Date.now()}.wav`);
      const convertedPath = path.join(tempDir, `converted_${Date.now()}.wav`);

      try {
        // 一時ファイルに保存
        await fs.promises.mkdir(tempDir, { recursive: true });
        await fs.promises.writeFile(tempFile, audio);

        // WAV形式に変換
        await convertToWav(tempFile, convertedPath);

        // Azure Speech Servicesの設定
        const pushStream = sdk.AudioInputStream.createPushStream();
        const fileStream = fs.createReadStream(convertedPath);
        
        await pipeline(fileStream, async function* (source) {
          for await (const chunk of source) {
            const arrayBuffer = Buffer.isBuffer(chunk) 
              ? new Uint8Array(chunk).buffer 
              : Buffer.from(chunk).buffer;
            pushStream.write(arrayBuffer);
          }
          pushStream.close();
        });

        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
          referenceText,
          sdk.PronunciationAssessmentGradingSystem.HundredMark,
          sdk.PronunciationAssessmentGranularity.Phoneme,
          true
        );
        pronunciationConfig.enableProsodyAssessment = true;
        pronunciationConfig.nbestPhonemeCount = 5;

        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationConfig.applyTo(recognizer);

        const result = await new Promise((resolve, reject) => {
          recognizer.recognizeOnceAsync(
            (result: any) => {
              if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                resolve(JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)));
              } else {
                reject(new Error('Recognition failed: ' + result.errorDetails));
              }
              recognizer.close();
            },
            (err: any) => {
              reject(new Error('Recognition error: ' + err));
              recognizer.close();
            }
          );
        });

        // 一時ファイルの削除
        await fs.promises.unlink(tempFile);
        await fs.promises.unlink(convertedPath);

        return result;
      } catch (error) {
        // エラー時も一時ファイルを削除
        try {
          await fs.promises.unlink(tempFile);
          await fs.promises.unlink(convertedPath);
        } catch (e) {
          console.error('Error cleaning up temporary files:', e);
        }
        throw error;
      }
    },
  });
};

export default pronunciationRoutes; 