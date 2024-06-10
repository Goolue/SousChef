import { FullRecipeInfo } from '../hooks/recipeAnalyzer';
import { Card, List, Text } from 'react-native-paper';
import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { BounceInDown } from 'react-native-reanimated';

interface RecipeSummaryProps {
    recipeInfo: FullRecipeInfo;
    itemNumberOfLines?: number
    titleNumberOfLines?: number
}

interface SummaryItemProps {
    title: string
}


const RecipeSummary: React.FC<RecipeSummaryProps> = ({ recipeInfo, itemNumberOfLines = 20, titleNumberOfLines = 3 }) => {
    const SummaryItem: React.FC<SummaryItemProps> = (props: SummaryItemProps) => {
        return (
            <ScrollView>
                <List.Item title={props.title} titleNumberOfLines={itemNumberOfLines} />
            </ScrollView>
        )
    };

    return (
        <Animated.View entering={BounceInDown.duration(1000)}>
            <Card mode='contained'>
                <Card.Title title={recipeInfo.title} titleNumberOfLines={titleNumberOfLines} />
                <Card.Content>
                    <View>
                        <List.AccordionGroup>
                            <List.Accordion title="Intro" id='intro'>
                                {recipeInfo.intro && <SummaryItem title={recipeInfo.intro} />}
                            </List.Accordion>
                            {recipeInfo.prepAndCookTime && <List.Accordion title="Preparation and Cooking Time" id='prep'>
                                {recipeInfo.prepAndCookTime.workTime && <SummaryItem title={`Work time: ${recipeInfo.prepAndCookTime.workTime}`} />}
                                {recipeInfo.prepAndCookTime.totalTime && <SummaryItem title={`Total time: ${recipeInfo.prepAndCookTime.totalTime}`} />}
                                {recipeInfo.prepAndCookTime.difficulty && <SummaryItem title={`Difficulty: ${recipeInfo.prepAndCookTime.difficulty}`} />}
                            </List.Accordion>}
                            <List.Accordion title="Ingredients" id='ingredients'>
                                {recipeInfo.ingredients.map((ingredient, index) => (
                                    <SummaryItem key={index} title={`${index + 1}. ${ingredient}`} />
                                ))}
                            </List.Accordion>
                            <List.Accordion title="Steps" id='steps'>
                                {recipeInfo.steps.map((step, index) => (
                                    <SummaryItem key={index} title={`${index + 1}. ${step}`} />
                                ))}
                            </List.Accordion>
                            {recipeInfo.comments && recipeInfo.comments.length > 0 &&
                                <List.Accordion title="Comments" id='comments'>
                                    {recipeInfo.comments.map((comment, index) => (
                                        <SummaryItem key={index} title={`${index + 1}. ${comment}`} />)
                                    )}
                                </List.Accordion>}
                        </List.AccordionGroup>

                    </View>
                </Card.Content>
            </Card>
        </Animated.View>
    );
};

export default RecipeSummary;