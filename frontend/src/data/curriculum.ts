import { CurriculumData } from '@/types/curriculum';

export const curriculumData: CurriculumData = {
  competencies: [
    {
      id: 'SEG-LIQUID-LR-007',
      title: '/l/ vs /r/ 対立',
      description: '流音の対立（最重要）',
      phonemes: ['/l/', '/r/'],
      stages: [
        {
          id: 'SEG-LIQUID-LR-007-1',
          type: 'lecture',
          title: '講義（理解・分析）',
          description: '/l/と/r/の調音の違いを学習',
          competency: '学習者は/l/と/r/の調音の違い（舌尖接触 vs 舌後退）を詳細に説明できる',
          content: {
            lecture: {
              title: '/l/と/r/の調音メカニズム',
              points: [
                '/l/の舌尖歯茎接触',
                '/r/の舌の後方巻き',
                '日本語「ら行」との根本的違い',
                '語頭・語中・語末での特徴',
                'Dark L vs Light Lの概念'
              ]
            }
          },
          unlocked: true,
          completed: false
        },
        {
          id: 'SEG-LIQUID-LR-007-2',
          type: 'perception',
          title: '知覚（聞き分け）',
          description: '/l/と/r/の聞き分けクイズ（10問）',
          competency: '学習者は語頭、語中、語末の/l/と/r/を95%以上の精度で識別できる',
          content: {
            quiz: {
              questions: [
                { word1: 'lock', word2: 'rock', audio1: '/sound/output_audio/lock_l.mp3', audio2: '/sound/output_audio/rock_r.mp3' },
                { word1: 'load', word2: 'road', audio1: '/sound/output_audio/load_l.mp3', audio2: '/sound/output_audio/road_r.mp3' },
                { word1: 'lace', word2: 'race', audio1: '/sound/output_audio/lace_l.mp3', audio2: '/sound/output_audio/race_r.mp3' },
                { word1: 'lent', word2: 'rent', audio1: '/sound/output_audio/lent_l.mp3', audio2: '/sound/output_audio/rent_r.mp3' },
                { word1: 'lice', word2: 'rice', audio1: '/sound/output_audio/lice_l.mp3', audio2: '/sound/output_audio/rice_r.mp3' },
                { word1: 'low', word2: 'row', audio1: '/sound/output_audio/low_l.mp3', audio2: '/sound/output_audio/row_r.mp3' },
                { word1: 'lake', word2: 'rake', audio1: '/sound/output_audio/lake_l.mp3', audio2: '/sound/output_audio/rake_r.mp3' },
                { word1: 'lead', word2: 'read', audio1: '/sound/output_audio/lead_l.mp3', audio2: '/sound/output_audio/read_r.mp3' },
                { word1: 'led', word2: 'red', audio1: '/sound/output_audio/led_l.mp3', audio2: '/sound/output_audio/red_r.mp3' }
              ],
              passingScore: 95
            }
          },
          unlocked: false,
          completed: false
        },
        {
          id: 'SEG-LIQUID-LR-007-3',
          type: 'production',
          title: '生成（発音練習）',
          description: '/l/と/r/を含む文の発音練習（10文）',
          competency: '学習者は/l/と/r/を含む文を、Azure評価で平均85点以上で発音できる',
          content: {
            practice: {
              sentences: [
                { text: "Laura's brother lives in a rural area.", targetWords: ['Laura', 'brother', 'lives', 'rural'] },
                { text: "The library has really helpful librarians.", targetWords: ['library', 'really', 'librarians'] },
                { text: "Please collect all the colorful flowers.", targetWords: ['Please', 'collect', 'all', 'colorful', 'flowers'] },
                { text: "Robert loves to travel around the world.", targetWords: ['Robert', 'loves', 'travel', 'around', 'world'] },
                { text: "The girl's red dress looks really lovely.", targetWords: ['girl', 'red', 'dress', 'looks', 'really', 'lovely'] },
                { text: "Larry learned to drive a large truck.", targetWords: ['Larry', 'learned', 'drive', 'large', 'truck'] },
                { text: "Every morning she drinks fresh milk.", targetWords: ['Every', 'morning', 'drinks', 'fresh', 'milk'] },
                { text: "The children played in the clear pool.", targetWords: ['children', 'played', 'clear', 'pool'] },
                { text: "Her brilliant smile brightened everyone's day.", targetWords: ['Her', 'brilliant', 'smile', 'brightened', 'everyone'] },
                { text: "Please remember to lock the front door.", targetWords: ['Please', 'remember', 'lock', 'front', 'door'] }
              ],
              passingScore: 85,
              targetPhonemes: ['/l/', '/r/']
            }
          },
          unlocked: false,
          completed: false
        }
      ]
    },
    {
      id: 'SEG-STOP-PB-001',
      title: '/p/ vs /b/ 対立',
      description: '破裂音の有声・無声対立',
      phonemes: ['/p/', '/b/'],
      stages: [
        {
          id: 'SEG-STOP-PB-001-1',
          type: 'lecture',
          title: '講義（理解・分析）',
          description: '/p/と/b/の調音の違いを学習',
          competency: '学習者は/p/と/b/の調音の違い（声帯振動の有無、気流の強さ）を説明できる',
          content: {
            lecture: {
              title: '/p/と/b/の調音メカニズム',
              points: [
                '両唇破裂音の調音メカニズム',
                '有声・無声の物理的違い',
                '手を喉に当てた振動確認実験',
                '語頭・語中・語末での音響的特徴の違い'
              ]
            }
          },
          unlocked: false,
          completed: false
        },
        {
          id: 'SEG-STOP-PB-001-2',
          type: 'perception',
          title: '知覚（聞き分け）',
          description: '/p/と/b/の聞き分けクイズ（10問）',
          competency: '学習者は語頭、語中、語末の/p/と/b/を90%以上の精度で識別できる',
          content: {
            quiz: {
              questions: [
                { word1: 'pat', word2: 'bat' },
                { word1: 'pen', word2: 'ben' },
                { word1: 'pig', word2: 'big' },
                { word1: 'happy', word2: 'abby' },
                { word1: 'super', word2: 'sober' },
                { word1: 'cap', word2: 'cab' },
                { word1: 'rope', word2: 'robe' },
                { word1: 'lip', word2: 'rib' },
                { word1: 'map', word2: 'mob' },
                { word1: 'cup', word2: 'cub' }
              ],
              passingScore: 90
            }
          },
          unlocked: false,
          completed: false
        },
        {
          id: 'SEG-STOP-PB-001-3',
          type: 'production',
          title: '生成（発音練習）',
          description: '/p/と/b/を含む文の発音練習（10文）',
          competency: '学習者は/p/と/b/を含む文を、Azure評価で平均80点以上で発音できる',
          content: {
            practice: {
              sentences: [
                { text: "Pat put the big pen in her bag.", targetWords: ['Pat', 'put', 'big', 'pen', 'bag'] },
                { text: "Bob plays baseball in the public park.", targetWords: ['Bob', 'plays', 'baseball', 'public', 'park'] },
                { text: "Please buy some apples and grapes.", targetWords: ['Please', 'buy', 'apples', 'grapes'] },
                { text: "The baby dropped the cup on the rug.", targetWords: ['baby', 'dropped', 'cup'] },
                { text: "Peter's brother works at the bank.", targetWords: ['Peter', 'brother', 'bank'] },
                { text: "She wrapped the book in brown paper.", targetWords: ['wrapped', 'book', 'brown', 'paper'] },
                { text: "Bob's laptop has a broken keyboard.", targetWords: ['Bob', 'laptop', 'broken', 'keyboard'] },
                { text: "Please help me spell this word properly.", targetWords: ['Please', 'help', 'spell', 'properly'] },
                { text: "The shop sells both maps and globes.", targetWords: ['shop', 'both', 'maps', 'globes'] },
                { text: "Paul grabbed his backpack and left.", targetWords: ['Paul', 'grabbed', 'backpack'] }
              ],
              passingScore: 80,
              targetPhonemes: ['/p/', '/b/']
            }
          },
          unlocked: false,
          completed: false
        }
      ]
    }
  ]
};