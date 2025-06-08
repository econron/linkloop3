import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync } from 'fastify';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { analyzeAndSavePronunciation, getPronunciationSummary } from '../services/pronunciation';
import { generatePersonalizedFeedback } from '../services/feedbackService';

ffmpeg.setFfmpegPath(ffmpegPath as string);

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY!;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION!;
const prisma = new PrismaClient();

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'PronunciationRawResults';
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  endpoint: process.env.DYNAMODB_ENDPOINT, // ローカル用
  credentials: process.env.DYNAMODB_ENDPOINT
    ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy' }
    : undefined,
});

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

  // 発音評価のアドバンストエンドポイント
  fastify.post('/pronunciation-assessment-advanced', async (request, reply) => {
    const parts = request.parts();
    let audioFile: any = null;
    let referenceText: string | null = null;
    const tempDir = path.join(process.cwd(), 'uploads');
    await fs.promises.mkdir(tempDir, { recursive: true });
    let tempFile = '';
    let convertedPath = '';

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'audio') {
        tempFile = path.join(tempDir, `temp_${Date.now()}_${part.filename}`);
        const ws = fs.createWriteStream(tempFile);
        await pipeline(part.file, ws);
        audioFile = tempFile;
      } else if (part.type === 'field' && part.fieldname === 'referenceText') {
        referenceText = part.value as string;
      }
    }

    if (!audioFile || !referenceText) {
      if (audioFile) {
        try { await fs.promises.unlink(audioFile); } catch {}
      }
      return reply.status(400).send({ error: 'audio and referenceText required' });
    }

    convertedPath = path.join(tempDir, `converted_${Date.now()}.wav`);
    try {
      await convertToWav(audioFile, convertedPath);
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
        true // enableMiscue: true (advanced)
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

      // 発音の癖を集計
      const userId = request.headers['x-user-id'] as string;
      if (userId) {
        await analyzeAndSavePronunciation(userId, 1, result as any);
      }

      // 一時ファイルの削除
      try { await fs.promises.unlink(audioFile); } catch {}
      try { await fs.promises.unlink(convertedPath); } catch {}

      return reply.send(result);
    } catch (error) {
      try { await fs.promises.unlink(audioFile); } catch {}
      try { await fs.promises.unlink(convertedPath); } catch {}
      return reply.status(500).send({ error: 'Processing error', details: String(error) });
    }
  });

  // 発音の癖集計を取得するエンドポイント
  fastify.get('/pronunciation-assessment/summary', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    if (!userId) {
      return reply.status(401).send({ error: 'User ID is required' });
    }

    try {
      const summary = await getPronunciationSummary(userId);
      return reply.send(summary);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to get pronunciation summary', details: String(error) });
    }
  });

  // DynamoDB保存API
  fastify.post('/pronunciation-assessment/save-raw', async (request, reply) => {
    const { userId, unitId, phrase, rawResult } = request.body as {
      userId: string;
      unitId: string;
      phrase: string;
      rawResult: any;
    };
    const timestamp = new Date().toISOString();
    if (!userId || !unitId || !phrase || !rawResult) {
      return reply.status(400).send({ error: 'userId, unitId, phrase, rawResult are required' });
    }
    try {
      const item = marshall({
        userId,
        unitId,
        phrase,
        timestamp,
        rawResult,
      });
      await dynamoClient.send(new PutItemCommand({
        TableName: DYNAMODB_TABLE,
        Item: item,
      }));
      return reply.send({ success: true });
    } catch (error) {
      return reply.status(500).send({ success: false, error: String(error) });
    }
  });

  // RDB集計保存API
  fastify.post('/pronunciation-assessment/save-summary', async (request, reply) => {
    const { userId, unitId, azureResponse } = request.body as {
      userId: string;
      unitId: number;
      azureResponse: any;
    };

    console.log('Received save-summary request:', { userId, unitId });

    if (!userId || !unitId || !azureResponse) {
      console.log('Missing required fields:', { userId, unitId, hasAzureResponse: !!azureResponse });
      return reply.status(400).send({ error: 'userId, unitId and azureResponse are required' });
    }

    try {
      const analysisId = await analyzeAndSavePronunciation(userId, unitId, azureResponse);
      console.log('save-summary: analysisId =', analysisId);
      return reply.send({ success: true, analysisId });
    } catch (error) {
      console.error('Error saving pronunciation summary:', error);
      return reply.status(500).send({ error: 'Failed to save pronunciation summary', details: String(error) });
    }
  });

  // 発音評価のフィードバックを取得するエンドポイント
  fastify.get<{
    Params: { analysisId: string };
    Querystring: { focusOn?: string; includeGeneralAdvice?: string };
  }>('/pronunciation-assessment/:analysisId/feedback', {
    schema: {
      params: {
        type: 'object',
        required: ['analysisId'],
        properties: {
          analysisId: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          focusOn: { type: 'string' },
          includeGeneralAdvice: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { analysisId } = request.params;
      const { focusOn, includeGeneralAdvice } = request.query;

      try {
        const feedback = await generatePersonalizedFeedback(parseInt(analysisId), {
          focusOn: focusOn ? focusOn.split(',') : undefined,
          includeGeneralAdvice: includeGeneralAdvice === 'true',
        });

        return reply.send({ feedback });
      } catch (error) {
        console.error('Error generating feedback:', error);
        return reply.status(500).send({ error: 'Failed to generate feedback' });
      }
    },
  });
};

export default pronunciationRoutes; 