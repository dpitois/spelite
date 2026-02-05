import { Character } from "../models/Character";
import {
  activeCharacterId,
  characterName,
  className,
  subclass,
  race,
  level,
  stats,
  hp,
  baseAC,
  knownSpells,
  preparedSpells,
  usedSlots,
} from "../store/signals";

// Create a stable Singleton instance of the Character model.
// It is bound to the global signals imported from the store.
// Since signals are stable references, this instance never needs to be recreated.
const characterModel = new Character({
  id: activeCharacterId,
  name: characterName,
  className: className,
  subclass: subclass,
  race: race,
  level: level,
  stats: stats,
  hp: hp,
  baseAC: baseAC,
  knownSpells: knownSpells,
  preparedSpells: preparedSpells,
  usedSlots: usedSlots,
});

export function useCharacter() {
  // Return the reactive model.
  // Accessing properties (getters) on this object within a component
  // will automatically subscribe the component to updates via Preact Signals.
  return characterModel;
}
