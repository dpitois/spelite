import { Signal, computed, type ReadonlySignal } from "@preact/signals";
import * as rules from "../utils/rules";
import type {
  Spell,
  SpellDictionary,
  HPState,
  Translation,
  AbilityScores,
  UsedSlotsState,
} from "../types/dnd";

export interface CharacterSignals {
  id: Signal<string>;
  name: Signal<string>;
  className: Signal<string>;
  subclass: Signal<string>;
  race: Signal<string>;
  level: Signal<number>;
  stats: Signal<AbilityScores>;
  hp: Signal<HPState>;
  baseAC: Signal<number>;
  knownSpells: Signal<string[]>;
  preparedSpells: Signal<string[]>;
  usedSlots: Signal<UsedSlotsState>;
}

export class Character {
  // Raw signals exposed for advanced usage / future migration
  public readonly $: CharacterSignals;

  // Computed signals
  private readonly _slots: ReadonlySignal<number[]>;
  private readonly _bonusSpellIndexes: ReadonlySignal<string[]>;
  private readonly _spellSources: ReadonlySignal<string[]>;
  private readonly _proficiencyBonus: ReadonlySignal<number>;
  private readonly _ac: ReadonlySignal<number>;
  private readonly _initiative: ReadonlySignal<number>;
  private readonly _spellcastingAbility: ReadonlySignal<string>;
  private readonly _spellcastingModifier: ReadonlySignal<number>;
  private readonly _spellSaveDC: ReadonlySignal<number>;
  private readonly _spellAttackBonus: ReadonlySignal<number>;
  private readonly _maxPreparedSpells: ReadonlySignal<number>;
  private readonly _isPrepareAllClass: ReadonlySignal<boolean>;
  private readonly _maxSpellLevel: ReadonlySignal<number>;

  constructor(signals: CharacterSignals) {
    this.$ = signals;

    // Computed Logic
    this._slots = computed(() =>
      rules.calculateSlots(
        this.$.className.value,
        this.$.level.value,
        this.$.subclass.value,
      ),
    );

    this._bonusSpellIndexes = computed(() =>
      rules.getBonusSpells(this.$.subclass.value, this.$.level.value),
    );

    this._spellSources = computed(() =>
      rules.getSpellSources(
        this.$.className.value,
        this.$.subclass.value,
        this.$.race.value,
      ),
    );

    this._proficiencyBonus = computed(() =>
      rules.calculateProficiency(this.$.level.value),
    );

    this._ac = computed(() =>
      rules.calculateAC(this.$.stats.value.dex, this.$.baseAC.value),
    );

    this._initiative = computed(() =>
      rules.calculateInitiative(this.$.stats.value.dex),
    );

    this._spellcastingAbility = computed(() =>
      rules.getSpellcastingAbility(
        this.$.className.value,
        this.$.subclass.value,
      ),
    );

    this._spellcastingModifier = computed(() =>
      rules.calculateModifier(
        this.$.stats.value[
          this._spellcastingAbility.value as keyof AbilityScores
        ] || 10,
      ),
    );

    this._spellSaveDC = computed(
      () => 8 + this._proficiencyBonus.value + this._spellcastingModifier.value,
    );

    this._spellAttackBonus = computed(
      () => this._proficiencyBonus.value + this._spellcastingModifier.value,
    );

    this._maxPreparedSpells = computed(() =>
      rules.calculateMaxPrepared(
        this.$.className.value,
        this.$.level.value,
        this._spellcastingModifier.value,
      ),
    );

    this._isPrepareAllClass = computed(() =>
      rules.PREPARE_ALL_CLASSES.includes(this.$.className.value.toLowerCase()),
    );

    this._maxSpellLevel = computed(() =>
      this._slots.value.length > 0 ? this._slots.value.length : 0,
    );
  }

  // --- Legacy Getters (unwrap signals for backward compatibility) ---
  // Accessing these inside a Preact component will automatically subscribe it.

  get id() {
    return this.$.id.value;
  }
  get name() {
    return this.$.name.value;
  }
  get className() {
    return this.$.className.value;
  }
  get subclass() {
    return this.$.subclass.value;
  }
  get race() {
    return this.$.race.value;
  }
  get level() {
    return this.$.level.value;
  }
  get stats() {
    return this.$.stats.value;
  }
  get hp() {
    return this.$.hp.value;
  }
  get baseAC() {
    return this.$.baseAC.value;
  }
  get knownSpells() {
    return this.$.knownSpells.value;
  }
  get preparedSpells() {
    return this.$.preparedSpells.value;
  }
  get usedSlots() {
    return this.$.usedSlots.value;
  }

  get slots() {
    return this._slots.value;
  }
  get bonusSpellIndexes() {
    return this._bonusSpellIndexes.value;
  }
  get spellSources() {
    return this._spellSources.value;
  }
  get proficiencyBonus() {
    return this._proficiencyBonus.value;
  }
  get ac() {
    return this._ac.value;
  }
  get initiative() {
    return this._initiative.value;
  }
  get spellcastingAbility() {
    return this._spellcastingAbility.value;
  }
  get spellcastingModifier() {
    return this._spellcastingModifier.value;
  }
  get spellSaveDC() {
    return this._spellSaveDC.value;
  }
  get spellAttackBonus() {
    return this._spellAttackBonus.value;
  }
  get maxPreparedSpells() {
    return this._maxPreparedSpells.value;
  }
  get isPrepareAllClass() {
    return this._isPrepareAllClass.value;
  }
  get maxSpellLevel() {
    return this._maxSpellLevel.value;
  }

  // --- Logic methods ---

  getPreparedSpellsList(spellDetails: SpellDictionary) {
    const bonusIds = this._bonusSpellIndexes.value;
    const manualAndBonus = Array.from(
      new Set([...this.$.preparedSpells.value, ...bonusIds]),
    );

    const list = manualAndBonus
      .map((id) => spellDetails[id])
      .filter((s): s is Spell => !!s);

    const knownCantrips = Object.values(spellDetails).filter(
      (s) => s.level === 0 && this.$.knownSpells.value.includes(s.index),
    );
    knownCantrips.forEach((cantrip) => {
      if (!manualAndBonus.includes(cantrip.index)) {
        list.push(cantrip);
      }
    });

    return list.sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name),
    );
  }

  getManualPreparedCount(spellDetails: SpellDictionary) {
    const bonusIds = this._bonusSpellIndexes.value;
    return this.$.preparedSpells.value.filter((id) => {
      const spell = spellDetails[id];
      return spell && spell.level > 0 && !bonusIds.includes(id);
    }).length;
  }

  getKnownSpellsList(spellDetails: SpellDictionary) {
    return this.$.knownSpells.value
      .map((id) => spellDetails[id])
      .filter((s): s is Spell => !!s)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }

  togglePrepareSpell(
    spell: Spell,
    spellDetails: SpellDictionary,
    t: Translation,
  ) {
    const isBonus = this._bonusSpellIndexes.value.includes(spell.index);
    if (spell.level === 0 || isBonus) return;

    if (this.$.preparedSpells.value.includes(spell.index)) {
      this.$.preparedSpells.value = this.$.preparedSpells.value.filter(
        (id) => id !== spell.index,
      );
    } else {
      const currentCount = this.getManualPreparedCount(spellDetails);
      const max = this._maxPreparedSpells.value;
      if (max === -1 || currentCount < max) {
        this.$.preparedSpells.value = [
          ...this.$.preparedSpells.value,
          spell.index,
        ];
      } else {
        alert(
          (t.dashboard.maxPreparedReached as string).replace(
            "{{n}}",
            max.toString(),
          ),
        );
      }
    }
  }

  castSpell(spell: Spell, t: Translation) {
    if (spell.level === 0) return;

    const total = this._slots.value[spell.level - 1] || 0;
    const used = this.$.usedSlots.value[spell.level] || 0;

    if (used < total) {
      this.$.usedSlots.value = {
        ...this.$.usedSlots.value,
        [spell.level]: used + 1,
      };
    } else {
      alert(
        (t.dashboard.noSlotsLeft as string).replace(
          "{{n}}",
          spell.level.toString(),
        ),
      );
    }
  }

  takeLongRest(t: Translation) {
    if (window.confirm(t.dashboard.longRestConfirm as string)) {
      this.$.hp.value = {
        ...this.$.hp.value,
        current: this.$.hp.value.max,
        temp: 0,
      };
      this.$.usedSlots.value = {};
    }
  }

  updateHP(current: number) {
    this.$.hp.value = {
      ...this.$.hp.value,
      current: Math.max(0, Math.min(this.$.hp.value.max, current)),
    };
  }

  toJSON() {
    return {
      id: this.$.id.value,
      name: this.$.name.value,
      className: this.$.className.value,
      subclass: this.$.subclass.value,
      race: this.$.race.value,
      level: this.$.level.value,
      stats: this.$.stats.value,
      hp: this.$.hp.value,
      baseAC: this.$.baseAC.value,
      knownSpells: this.$.knownSpells.value,
      preparedSpells: this.$.preparedSpells.value,
      usedSlots: this.$.usedSlots.value,
    };
  }
}
