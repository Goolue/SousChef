import { FullRecipeInfo } from '../hooks/recipeAnalyzer';
import { Card, List } from 'react-native-paper';
import React from 'react';
import { View } from 'react-native';

interface RecipeSummaryProps {
    recipeInfo: FullRecipeInfo;
}

const RecipeSummary: React.FC<RecipeSummaryProps> = ({ recipeInfo }) => {

    return (
        <Card>
            <Card.Title title={recipeInfo.title} />
            <Card.Content>
                <View>
                    <List.AccordionGroup>
                        <List.Accordion title="Intro">
                            <List.Item title={recipeInfo.intro} />
                        </List.Accordion>
                        {recipeInfo.prepAndCookTime && <List.Accordion title="Preparation and Cooking Time">
                            {recipeInfo.prepAndCookTime.workTime && <List.Item title={`Work time: ${recipeInfo.prepAndCookTime.workTime}`} />}
                            {recipeInfo.prepAndCookTime.totalTime && <List.Item title={`Total time: ${recipeInfo.prepAndCookTime.totalTime}`} />}
                            {recipeInfo.prepAndCookTime.difficulty && <List.Item title={`Difficulty: ${recipeInfo.prepAndCookTime.difficulty}`} />}
                        </List.Accordion>}
                        <List.Accordion title="Ingredients">
                            {recipeInfo.ingredients.map((ingredient, index) => (
                                <List.Item key={index} title={ingredient} />
                            ))}
                        </List.Accordion>
                        <List.Accordion title="Steps">
                            {recipeInfo.steps.map((step, index) => (
                                <List.Item key={index} title={step} />
                            ))}
                        </List.Accordion>
                        {recipeInfo.comments && <List.Accordion title="Comments">
                            <List.Item title={recipeInfo.comments} />
                        </List.Accordion>}
                    </List.AccordionGroup>

                </View>
            </Card.Content>
        </Card>
    );
};

export default RecipeSummary;