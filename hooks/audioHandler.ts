import OpenAiUtils from '../constants/OpenaiConstants';
import { AVPlaybackStatus, AVPlaybackStatusSuccess, Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { measureDuration } from './utils/durationUtils';
import * as WavEncoder from 'wav-encoder';
import fastq from 'fastq';
import type { queueAsPromised } from 'fastq';

const client = OpenAiUtils.client;

export async function tts(text: string): Promise<AVPlaybackStatus> {
    console.log(`TTS: ${text}`);
    const response = await measureDuration('TTS', async () => {
        return client.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });
    });

    console.log('TTS got response. Playing sound')

    return measureDuration('playSound', async () => {
        const blob = await response.blob();
        const buffer = await toBuffer(blob);
        const tempFilePath = await constructTempFilePath(buffer);
        const { sound } = await Audio.Sound.createAsync({ uri: tempFilePath });
        return sound.playAsync();
    });
}

const constructTempFilePath = async (buffer: Buffer) => {
    const tempFilePath = FileSystem.cacheDirectory + "speech.mp3";
    await FileSystem.writeAsStringAsync(
        tempFilePath,
        buffer.toString("base64"),
        {
            encoding: FileSystem.EncodingType.Base64,
        }
    );

    return tempFilePath;
}

const toBuffer = async (blob: Blob) => {
    const uri = await toDataURI(blob);
    const base64 = uri.replace(/^.*,/g, "");
    return Buffer.from(base64, "base64");
};

const toDataURI = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const uri = reader.result?.toString();
            resolve(uri as string);
        };
    });

// Function to convert base64 to buffer
const base64ToBuffer = (base64: string): Uint8Array => {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
};

// Function to convert Int16 PCM to Float32
const int16ToFloat32 = (int16Array: Int16Array): Float32Array => {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        // Convert Int16 to Float32 (-32768...32767 => -1...1)
        float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
};

// Function to convert raw PCM data to WAV format
const convertPcmToWav = async (pcmData: Uint8Array): Promise<Uint8Array> => {
    // Create Int16Array view of the data
    const int16Data = new Int16Array(
        pcmData.buffer,
        pcmData.byteOffset,
        pcmData.length / 2  // 2 bytes per sample
    );

    // Convert to Float32Array
    const float32Data = int16ToFloat32(int16Data);

    const audioData = {
        sampleRate: 24000,
        channelData: [float32Data]  // Now using proper Float32Array
    };

    const wavBuffer = await WavEncoder.encode(audioData);
    return new Uint8Array(wavBuffer);
};

// Type for processed audio
type ProcessedAudio = {
    sound: Audio.Sound;
    duration: number;
};

const processingQueue: queueAsPromised<string> = fastq.promise(async (base64: string) => {
    try {
        console.log('Processing audio');
        const pcmBuffer = base64ToBuffer(base64);
        const wavBuffer = await convertPcmToWav(pcmBuffer);
        const wavBase64 = Buffer.from(wavBuffer).toString('base64');
        const dataUri = `data:audio/wav;base64,${wavBase64}`;

        const sound = new Audio.Sound();
        await sound.loadAsync(
            { uri: dataUri },
            { 
                progressUpdateIntervalMillis: 10, 
                shouldPlay: false,
                rate: 1.0,
             }
        );

        const status = await sound.getStatusAsync() as AVPlaybackStatusSuccess;
        let isPlaying = false;
        
        // Set up status update handler
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            if (!isPlaying && (status as AVPlaybackStatusSuccess).isPlaying) {
                isPlaying = true;
                setTimeout(() => {
                    sound.unloadAsync();
                }, status.durationMillis || 0);
            }
        });

        await playbackQueue.push({
            sound,
            duration: status.durationMillis || 0
        });
        
    } catch (error) {
        console.error('Processing failed:', error);
    }
}, 20);

// Playback queue just handles playing pre-loaded sounds
const playbackQueue: queueAsPromised<ProcessedAudio> = fastq.promise(async ({ sound, duration }) => {
    try {
        let isPlaying = false;

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            if (!isPlaying && (status as AVPlaybackStatusSuccess).isPlaying) {
                isPlaying = true;
                setTimeout(() => {
                    sound.unloadAsync();
                }, duration);
            }
        });

        await sound.playAsync();
    } catch (error) {
        console.error('Playback failed:', error);
        await sound.unloadAsync();
    }
}, 1);

export const onAudioReceived = (base64: string) => {
    return processingQueue.push(base64);
};
