// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
    GoogleGenAI,
} from '@google/genai';
import mime from 'mime';
import { writeFile } from 'fs';

function saveBinaryFile(fileName: string, content: Buffer) {
    writeFile(fileName, content, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file ${fileName}:`, err);
            return;
        }
        console.log(`File ${fileName} saved to file system.`);
    });
}

async function main() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
        temperature: 1,
        responseModalities: [
            'audio',
        ],
        speechConfig: {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                    {
                        speaker: 'Speaker 1',
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Fenrir'
                            }
                        }
                    },
                    {
                        speaker: 'Speaker 2',
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Gacrux'
                            }
                        }
                    },
                ]
            },
        },
    };
    const model = 'gemini-2.5-pro-preview-tts';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `Read aloud this conversation between friends in a cafe discussing travel to Paris.
Speaker 1: Chloe, look at this! The Eiffel Tower lights up every hour at night! We have to see it from the Trocadéro, and then race to a bateau-mouche for the river view! It's going to be epic!
Speaker 2: I saw that, Liam. It does sound spectacular, a real Parisian icon, known for its dazzling beauty and romantic atmosphere.
Speaker 1: Wow! I wish we could teleport there right now! Imagine, zipping from museum to museum, hitting all the patisseries, and seeing every single arrondissement!
Speaker 2: It certainly has its appeal, rushing to see everything, but there are also benefits to a more relaxed pace, you know? We could just wander through Le Marais, discover little cafes, and really soak in the city.
Speaker 1: But wouldn't you ever want the thrill of a packed itinerary? To conquer all the major sights and feel like we've truly done Paris?
Speaker 2: Perhaps for a day, my friend. But for the most part, I'm looking forward to savoring the moments. And who knows, maybe I'll discover the best croissant in a tiny, hidden bakery while you're scaling the Arc de Triomphe.
Speaker 1: Maybe you will, Chloe! And maybe I'll bring you back a macaron from the top of Montmartre!
Speaker 2: That sounds like a delicious peace offering. Until then, enjoy your meticulous planning, Liam.
Speaker 1: I will, Chloe! Thanks for dreaming with me!`,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });
    let fileIndex = 0;
    for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
            continue;
        }
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            let fileExtension = mime.getExtension(inlineData.mimeType || '');
            let buffer = Buffer.from(inlineData.data || '', 'base64');
            if (!fileExtension) {
                fileExtension = 'wav';
                buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
            }
            saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
        }
        else {
            console.log(chunk.text);
        }
    }
}

main();

interface WavConversionOptions {
    numChannels: number,
    sampleRate: number,
    bitsPerSample: number
}

function convertToWav(rawData: string, mimeType: string) {
    const options = parseMimeType(mimeType)
    const wavHeader = createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, 'base64');

    return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options: Partial<WavConversionOptions> = {
        numChannels: 1,
    };

    if (format && format.startsWith('L')) {
        const bits = parseInt(format.slice(1), 10);
        if (!isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }

    for (const param of params) {
        const [key, value] = param.split('=').map(s => s.trim());
        if (key === 'rate') {
            options.sampleRate = parseInt(value, 10);
        }
    }

    return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
    const {
        numChannels,
        sampleRate,
        bitsPerSample,
    } = options;

    // http://soundfile.sapp.org/doc/WaveFormat

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0);                      // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
    buffer.write('WAVE', 8);                      // Format
    buffer.write('fmt ', 12);                     // Subchunk1ID
    buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);        // NumChannels
    buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
    buffer.writeUInt32LE(byteRate, 28);           // ByteRate
    buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
    buffer.write('data', 36);                     // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

    return buffer;
}
