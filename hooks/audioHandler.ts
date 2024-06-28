import OpenAiUtils from '../constants/OpenaiConstants';
import { AVPlaybackStatus, Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { measureDuration } from './utils/durationUtils';

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
};