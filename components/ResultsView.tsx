import Chat, { ChatMessage } from "@/components/Chat";
import RecipeSummary from "@/components/RecipeSummary";
import { FullRecipeInfo, askQuestion } from "@/hooks/recipeAnalyzer";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { FAB } from "react-native-paper";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export type ResultsViewProps = {
    fullRecipeInfo: FullRecipeInfo,
    threadId: string,
}

export default function ResultsView({fullRecipeInfo, threadId}: ResultsViewProps) {
    const [playSound, setPlaySound] = useState(true);
    const [keepAwake, setKeepAwake] = useState(false);

    const chatRef = useRef<{ sendMessage: (message: ChatMessage) => void } | null>(null);

    const ask = async (question: string) => {
        const answer = await askQuestion(question, threadId);
        const message: ChatMessage = {
            text: answer,
            user: {
                _id: 1,
                name: 'Chef'
            }
        };

        chatRef.current?.sendMessage(message);
    };

    const bottomSheetRef = useRef<BottomSheet>(null);


    return (
        <View>
            <ScrollView>
                <RecipeSummary recipeInfo={fullRecipeInfo} />
            </ScrollView>

             <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={[50, '90%']}
                enableContentPanningGesture={false} // Disable gestures inside the bottom sheet
            >
                <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Chat playSound={playSound} disableComposer={false} ref={chatRef} onSend={msg => ask(msg)} />
                </BottomSheetScrollView>
            </BottomSheet>

            <FAB
                style={{ ...styles.fab, ...styles.fabSpeak }}
                icon={playSound ? 'volume-off' : 'volume-high'}
                mode='flat'
                size='medium'
                onPress={() => {
                    setPlaySound(!playSound);
                    console.log(`Set playSound to ${!playSound}`)
                }}
            />
            <FAB
                style={{ ...styles.fab, ...styles.fabAlwaysOn }}
                icon={keepAwake ? 'eye-off' : 'eye'}
                mode='flat'
                size='small'
                onPress={() => {
                    if (!keepAwake) {
                        console.log('Activating keep awake');
                        activateKeepAwakeAsync();
                        setKeepAwake(true);
                    }
                    else {
                        console.log('Deactivating keep awake');
                        deactivateKeepAwake();
                        setKeepAwake(false);
                    }
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 30,
        borderWidth: 3,
        opacity: 0.8,
    },
    fabSpeak: {
        margin: 16,
        right: -10,
        bottom: 30,
    },
    fabAlwaysOn: {
        margin: 16,
        right: 0,
        bottom: 100,
    },
});