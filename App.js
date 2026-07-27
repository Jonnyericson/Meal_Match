import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const MEALS = [
  {
    name: "Chicken Rice Bowl",
    ingredients: ["chicken", "rice", "pepper", "onion"],
    budget: ["Low", "Medium", "High"],
    time: 30,
    description: "A simple bowl with seasoned chicken, rice, and vegetables.",
  },
  {
    name: "Vegetable Pasta",
    ingredients: ["pasta", "tomato", "pepper", "onion", "spinach"],
    budget: ["Low", "Medium", "High"],
    time: 25,
    description: "Quick pasta made with vegetables and a light tomato sauce.",
  },
  {
    name: "Bean and Cheese Quesadillas",
    ingredients: ["tortilla", "beans", "cheese"],
    budget: ["Low", "Medium"],
    time: 15,
    description: "Crispy quesadillas filled with beans and melted cheese.",
  },
  {
    name: "Egg Fried Rice",
    ingredients: ["egg", "rice", "peas", "carrot", "onion"],
    budget: ["Low", "Medium"],
    time: 20,
    description: "A fast meal that works well with leftover rice.",
  },
  {
    name: "Turkey Tacos",
    ingredients: ["turkey", "tortilla", "lettuce", "tomato", "cheese"],
    budget: ["Medium", "High"],
    time: 30,
    description: "Easy tacos with seasoned turkey and simple toppings.",
  },
  {
    name: "Baked Salmon and Vegetables",
    ingredients: ["salmon", "broccoli", "potato", "lemon"],
    budget: ["High"],
    time: 45,
    description: "A simple baked salmon dinner with vegetables.",
  },
];

const BUDGETS = ["Low", "Medium", "High"];
const TIMES = [15, 30, 45];

function ChoiceButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [ingredientText, setIngredientText] = useState("");
  const [budget, setBudget] = useState("Low");
  const [availableTime, setAvailableTime] = useState(30);
  const [showResults, setShowResults] = useState(false);

  const ingredients = useMemo(() => {
    return ingredientText
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [ingredientText]);

  const suggestions = useMemo(() => {
    if (!showResults) return [];

    return MEALS
      .filter(
        (meal) =>
          meal.budget.includes(budget) &&
          meal.time <= availableTime
      )
      .map((meal) => {
        const matches = meal.ingredients.filter((ingredient) =>
          ingredients.some(
            (enteredIngredient) =>
              enteredIngredient.includes(ingredient) ||
              ingredient.includes(enteredIngredient)
          )
        );

        return {
          ...meal,
          matches,
          score: matches.length,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [ingredients, budget, availableTime, showResults]);

  function findMeals() {
    setShowResults(true);
  }

  function startOver() {
    setIngredientText("");
    setBudget("Low");
    setAvailableTime(30);
    setShowResults(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.appName}>MealMatch</Text>
        <Text style={styles.subtitle}>
          Find a few meal ideas using what you already have.
        </Text>

        <View style={styles.card}>
          <Text style={styles.stepTitle}>1. Ingredients on hand</Text>
          <Text style={styles.helpText}>
            Separate each ingredient with a comma.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Example: chicken, rice, onion"
            value={ingredientText}
            onChangeText={(text) => {
              setIngredientText(text);
              setShowResults(false);
            }}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.stepTitle}>2. Budget level</Text>
          <View style={styles.choiceRow}>
            {BUDGETS.map((item) => (
              <ChoiceButton
                key={item}
                label={item}
                selected={budget === item}
                onPress={() => {
                  setBudget(item);
                  setShowResults(false);
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.stepTitle}>3. Cooking time</Text>
          <View style={styles.choiceRow}>
            {TIMES.map((minutes) => (
              <ChoiceButton
                key={minutes}
                label={`${minutes} min`}
                selected={availableTime === minutes}
                onPress={() => {
                  setAvailableTime(minutes);
                  setShowResults(false);
                }}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={findMeals}>
          <Text style={styles.primaryButtonText}>Find Meals</Text>
        </TouchableOpacity>

        {showResults && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Meal Suggestions</Text>

            {suggestions.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.mealName}>No matches found</Text>
                <Text style={styles.mealDescription}>
                  Try selecting more cooking time or another budget level.
                </Text>
              </View>
            ) : (
              suggestions.map((meal) => (
                <View key={meal.name} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.timeBadge}>{meal.time} min</Text>
                  </View>

                  <Text style={styles.mealDescription}>{meal.description}</Text>

                  <Text style={styles.smallLabel}>Ingredients used</Text>
                  <Text style={styles.matchText}>
                    {meal.matches.length > 0
                      ? meal.matches.join(", ")
                      : "This meal fits your budget and time, but may require groceries."}
                  </Text>
                </View>
              ))
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={startOver}>
              <Text style={styles.secondaryButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#26382A",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#5D675F",
    lineHeight: 23,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3E7E1",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#26382A",
    marginBottom: 6,
  },
  helpText: {
    fontSize: 13,
    color: "#737B74",
    marginBottom: 10,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#CBD3C9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#26382A",
    textAlignVertical: "top",
    backgroundColor: "#FCFDFC",
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  choiceButton: {
    flexGrow: 1,
    minWidth: 90,
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFC9BD",
    backgroundColor: "#FFFFFF",
  },
  choiceButtonSelected: {
    backgroundColor: "#345E3D",
    borderColor: "#345E3D",
  },
  choiceText: {
    color: "#345E3D",
    fontWeight: "600",
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#345E3D",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  resultsSection: {
    marginTop: 26,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#26382A",
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E3E7E1",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#26382A",
  },
  timeBadge: {
    backgroundColor: "#EAF0E8",
    color: "#345E3D",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  mealDescription: {
    fontSize: 14,
    color: "#5D675F",
    lineHeight: 20,
    marginTop: 8,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#737B74",
    textTransform: "uppercase",
    marginTop: 14,
  },
  matchText: {
    fontSize: 14,
    color: "#345E3D",
    marginTop: 4,
    lineHeight: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#345E3D",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryButtonText: {
    color: "#345E3D",
    fontSize: 16,
    fontWeight: "700",
  },
});
