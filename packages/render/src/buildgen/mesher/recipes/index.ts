import type { BuildRecipeKey, Recipe } from '../../types';
import { adobeRecipe } from './adobe';
import { citywallRecipe } from './citywall';
import { compoundRecipe } from './compound';
import { gateRecipe } from './gate';
import { hallRecipe } from './hall';
import { pagodaDenseRecipe } from './pagoda-dense';
import { pagodaOctRecipe } from './pagoda-oct';
import { stallRecipe } from './stall';
import { storeyedRecipe } from './storeyed';

export type RecipeKey = BuildRecipeKey;
export const RECIPES: Readonly<Record<RecipeKey, Recipe>> = Object.freeze({
  hall: hallRecipe,
  storeyed: storeyedRecipe,
  stall: stallRecipe,
  adobe: adobeRecipe,
  compound: compoundRecipe,
  pagoda_dense: pagodaDenseRecipe,
  pagoda_oct: pagodaOctRecipe,
  citywall: citywallRecipe,
  gate: gateRecipe,
});
export function recipeFor(key: RecipeKey): Recipe {
  const recipe = RECIPES[key];
  if (!recipe) throw new Error(`BUILDGEN_UNKNOWN_RECIPE:${key}`);
  return recipe;
}
