import {
  DifficultyLevel,
  EquipmentType,
  type MuscleGroup,
  MovementPattern,
  PrismaClient,
} from '@prisma/client';

type SeedExercise = {
  nameEs: string;
  nameEn: string;
  movementPattern: MovementPattern;
  difficulty: DifficultyLevel;
  equipmentType: EquipmentType;
  isCompound: boolean;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
};

type SeedAchievement = {
  code: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  iconUrl: string;
  condition: string;
};

type VolumeLandmarkDefault = {
  muscleGroup: MuscleGroup;
  mev: number;
  mrv: number;
};

const MIN_EXERCISE_COUNT = 150;

const createExercise = (
  nameEs: string,
  nameEn: string,
  movementPattern: MovementPattern,
  equipmentType: EquipmentType,
  isCompound: boolean,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[] = [],
  difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE,
): SeedExercise => ({
  nameEs,
  nameEn,
  movementPattern,
  difficulty,
  equipmentType,
  isCompound,
  primaryMuscles,
  secondaryMuscles,
});

const requiredExercisesBase: SeedExercise[] = [
  createExercise('Press banca con barra (plano)', 'Barbell Bench Press (Flat)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BARBELL, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Press banca con barra (inclinado)', 'Barbell Bench Press (Incline)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BARBELL, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Press banca con barra (declinado)', 'Barbell Bench Press (Decline)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BARBELL, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Press con mancuernas (plano)', 'Dumbbell Bench Press (Flat)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.DUMBBELL, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Press con mancuernas (inclinado)', 'Dumbbell Bench Press (Incline)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.DUMBBELL, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Aperturas con mancuernas (plano)', 'Dumbbell Fly (Flat)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.DUMBBELL, false, ['CHEST'], ['SHOULDERS']),
  createExercise('Aperturas con mancuernas (inclinado)', 'Dumbbell Fly (Incline)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.DUMBBELL, false, ['CHEST'], ['SHOULDERS']),
  createExercise('Cruces en poleas (alto)', 'Cable Crossover (High)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.CABLE, false, ['CHEST'], ['SHOULDERS']),
  createExercise('Cruces en poleas (medio)', 'Cable Crossover (Mid)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.CABLE, false, ['CHEST'], ['SHOULDERS']),
  createExercise('Cruces en poleas (bajo)', 'Cable Crossover (Low)', MovementPattern.HORIZONTAL_PUSH, EquipmentType.CABLE, false, ['CHEST'], ['SHOULDERS']),
  createExercise('Fondos en paralelas', 'Parallel Bar Dips', MovementPattern.VERTICAL_PUSH, EquipmentType.DIP_STATION, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Machine chest press', 'Machine Chest Press', MovementPattern.HORIZONTAL_PUSH, EquipmentType.MACHINE, true, ['CHEST'], ['TRICEPS']),
  createExercise('Push-ups', 'Push-ups', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BODYWEIGHT, true, ['CHEST'], ['TRICEPS', 'SHOULDERS']),
  createExercise('Push-ups (diamante)', 'Diamond Push-ups', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BODYWEIGHT, true, ['CHEST'], ['TRICEPS']),
  createExercise('Push-ups (inclinadas)', 'Incline Push-ups', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BENCH, true, ['CHEST'], ['TRICEPS']),
  createExercise('Push-ups (declinadas)', 'Decline Push-ups', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BENCH, true, ['CHEST'], ['TRICEPS']),

  createExercise('Dominadas (agarre prono)', 'Pull-up (Pronated Grip)', MovementPattern.VERTICAL_PULL, EquipmentType.PULL_UP_BAR, true, ['BACK'], ['BICEPS']),
  createExercise('Dominadas (agarre supino)', 'Chin-up (Supinated Grip)', MovementPattern.VERTICAL_PULL, EquipmentType.PULL_UP_BAR, true, ['BACK'], ['BICEPS']),
  createExercise('Dominadas (agarre neutro)', 'Neutral Grip Pull-up', MovementPattern.VERTICAL_PULL, EquipmentType.PULL_UP_BAR, true, ['BACK'], ['BICEPS']),
  createExercise('Jalón al pecho (agarre ancho)', 'Lat Pulldown (Wide Grip)', MovementPattern.VERTICAL_PULL, EquipmentType.CABLE, true, ['BACK'], ['BICEPS']),
  createExercise('Jalón al pecho (agarre estrecho)', 'Lat Pulldown (Close Grip)', MovementPattern.VERTICAL_PULL, EquipmentType.CABLE, true, ['BACK'], ['BICEPS']),
  createExercise('Jalón al pecho (agarre neutro)', 'Lat Pulldown (Neutral Grip)', MovementPattern.VERTICAL_PULL, EquipmentType.CABLE, true, ['BACK'], ['BICEPS']),
  createExercise('Remo con barra (prono)', 'Barbell Row (Pronated)', MovementPattern.HORIZONTAL_PULL, EquipmentType.BARBELL, true, ['BACK'], ['BICEPS']),
  createExercise('Remo con barra (supino)', 'Barbell Row (Supinated)', MovementPattern.HORIZONTAL_PULL, EquipmentType.BARBELL, true, ['BACK'], ['BICEPS']),
  createExercise('Remo con mancuerna', 'One-arm Dumbbell Row', MovementPattern.HORIZONTAL_PULL, EquipmentType.DUMBBELL, true, ['BACK'], ['BICEPS']),
  createExercise('Remo en cable sentado', 'Seated Cable Row', MovementPattern.HORIZONTAL_PULL, EquipmentType.CABLE, true, ['BACK'], ['BICEPS']),
  createExercise('Pullover con mancuerna', 'Dumbbell Pullover', MovementPattern.VERTICAL_PULL, EquipmentType.DUMBBELL, false, ['BACK'], ['CHEST']),
  createExercise('Pullover en polea', 'Cable Pullover', MovementPattern.VERTICAL_PULL, EquipmentType.CABLE, false, ['BACK']),
  createExercise('Face pulls', 'Face Pulls', MovementPattern.HORIZONTAL_PULL, EquipmentType.CABLE, false, ['SHOULDERS'], ['BACK', 'TRAPS']),
  createExercise('Remo T-bar', 'T-Bar Row', MovementPattern.HORIZONTAL_PULL, EquipmentType.MACHINE, true, ['BACK'], ['BICEPS']),

  createExercise('Press militar con barra', 'Barbell Overhead Press', MovementPattern.VERTICAL_PUSH, EquipmentType.BARBELL, true, ['SHOULDERS'], ['TRICEPS']),
  createExercise('Press Arnold', 'Arnold Press', MovementPattern.VERTICAL_PUSH, EquipmentType.DUMBBELL, true, ['SHOULDERS'], ['TRICEPS']),
  createExercise('Elevaciones laterales con mancuerna', 'Dumbbell Lateral Raise', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['SHOULDERS']),
  createExercise('Elevaciones laterales en cable', 'Cable Lateral Raise', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['SHOULDERS']),
  createExercise('Elevaciones frontales con barra', 'Barbell Front Raise', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['SHOULDERS']),
  createExercise('Elevaciones frontales con disco', 'Plate Front Raise', MovementPattern.ISOLATION, EquipmentType.NONE, false, ['SHOULDERS']),
  createExercise('Pájaros con mancuerna', 'Dumbbell Rear Delt Fly', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['SHOULDERS'], ['TRAPS']),
  createExercise('Pájaros en pec deck', 'Reverse Pec Deck', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['SHOULDERS'], ['TRAPS']),
  createExercise('Encogimientos con barra', 'Barbell Shrugs', MovementPattern.CARRY, EquipmentType.BARBELL, true, ['TRAPS']),
  createExercise('Encogimientos con mancuernas', 'Dumbbell Shrugs', MovementPattern.CARRY, EquipmentType.DUMBBELL, true, ['TRAPS']),

  createExercise('Curl con barra recta', 'Barbell Curl', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['BICEPS'], ['FOREARMS']),
  createExercise('Curl con barra EZ', 'EZ Bar Curl', MovementPattern.ISOLATION, EquipmentType.EZ_BAR, false, ['BICEPS'], ['FOREARMS']),
  createExercise('Curl alterno con mancuernas', 'Alternating Dumbbell Curl', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['BICEPS'], ['FOREARMS']),
  createExercise('Curl martillo', 'Hammer Curl', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['BICEPS'], ['FOREARMS']),
  createExercise('Curl concentrado', 'Concentration Curl', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['BICEPS']),
  createExercise('Curl en polea baja', 'Low Cable Curl', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['BICEPS'], ['FOREARMS']),
  createExercise('Curl en polea alta', 'High Cable Curl', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['BICEPS']),
  createExercise('Curl predicador', 'Preacher Curl', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['BICEPS']),
  createExercise('Curl inclinado', 'Incline Dumbbell Curl', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['BICEPS']),

  createExercise('Press francés con barra', 'Barbell French Press', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['TRICEPS']),
  createExercise('Press francés con mancuernas', 'Dumbbell French Press', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['TRICEPS']),
  createExercise('Extensión en polea con cuerda', 'Rope Triceps Pushdown', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['TRICEPS']),
  createExercise('Extensión en polea con barra V', 'V-Bar Triceps Pushdown', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['TRICEPS']),
  createExercise('Fondos en banco', 'Bench Dips', MovementPattern.VERTICAL_PUSH, EquipmentType.BENCH, true, ['TRICEPS'], ['CHEST']),
  createExercise('Kickbacks de tríceps', 'Triceps Kickbacks', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['TRICEPS']),
  createExercise('Close-grip bench press', 'Close-grip Bench Press', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BARBELL, true, ['TRICEPS'], ['CHEST']),
  createExercise('Extensión por encima de la cabeza', 'Overhead Triceps Extension', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['TRICEPS']),

  createExercise('Sentadilla con barra (alta)', 'High-bar Back Squat', MovementPattern.SQUAT, EquipmentType.BARBELL, true, ['QUADRICEPS'], ['GLUTES', 'CORE']),
  createExercise('Sentadilla con barra (baja)', 'Low-bar Back Squat', MovementPattern.SQUAT, EquipmentType.BARBELL, true, ['QUADRICEPS'], ['GLUTES', 'HAMSTRINGS']),
  createExercise('Sentadilla frontal', 'Front Squat', MovementPattern.SQUAT, EquipmentType.BARBELL, true, ['QUADRICEPS'], ['CORE']),
  createExercise('Prensa de piernas', 'Leg Press', MovementPattern.SQUAT, EquipmentType.LEG_PRESS, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Sentadilla búlgara', 'Bulgarian Split Squat', MovementPattern.SQUAT, EquipmentType.DUMBBELL, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Extensión de cuádriceps', 'Leg Extension', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['QUADRICEPS']),
  createExercise('Sentadilla goblet', 'Goblet Squat', MovementPattern.SQUAT, EquipmentType.DUMBBELL, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Hack squat', 'Hack Squat', MovementPattern.SQUAT, EquipmentType.HACK_SQUAT, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Zancadas', 'Lunges', MovementPattern.SQUAT, EquipmentType.DUMBBELL, true, ['QUADRICEPS'], ['GLUTES']),

  createExercise('Peso muerto rumano (RDL)', 'Romanian Deadlift', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['HAMSTRINGS'], ['GLUTES', 'BACK']),
  createExercise('Peso muerto convencional', 'Conventional Deadlift', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['BACK'], ['HAMSTRINGS', 'GLUTES']),
  createExercise('Peso muerto sumo', 'Sumo Deadlift', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['GLUTES'], ['HAMSTRINGS', 'BACK']),
  createExercise('Curl femoral sentado', 'Seated Leg Curl', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['HAMSTRINGS']),
  createExercise('Curl femoral tumbado', 'Lying Leg Curl', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['HAMSTRINGS']),
  createExercise('Hip thrust', 'Hip Thrust', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['GLUTES'], ['HAMSTRINGS']),
  createExercise('Good mornings', 'Good Mornings', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['HAMSTRINGS'], ['BACK', 'GLUTES']),
  createExercise('Nordic curl', 'Nordic Curl', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['HAMSTRINGS']),
  createExercise('Glute-ham raise', 'Glute-Ham Raise', MovementPattern.HIP_HINGE, EquipmentType.MACHINE, true, ['HAMSTRINGS'], ['GLUTES']),

  createExercise('Hip thrust con barra', 'Barbell Hip Thrust', MovementPattern.HIP_HINGE, EquipmentType.BARBELL, true, ['GLUTES'], ['HAMSTRINGS']),
  createExercise('Sentadilla sumo', 'Sumo Squat', MovementPattern.SQUAT, EquipmentType.DUMBBELL, true, ['GLUTES'], ['QUADRICEPS']),
  createExercise('Patada de glúteo en cable', 'Cable Glute Kickback', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['GLUTES']),
  createExercise('Patada de glúteo en máquina', 'Machine Glute Kickback', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['GLUTES']),
  createExercise('Puente de glúteos', 'Glute Bridge', MovementPattern.HIP_HINGE, EquipmentType.BODYWEIGHT, true, ['GLUTES']),
  createExercise('Abducción de cadera', 'Hip Abduction', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['GLUTES']),
  createExercise('Step-ups', 'Step-ups', MovementPattern.SQUAT, EquipmentType.DUMBBELL, true, ['GLUTES'], ['QUADRICEPS']),

  createExercise('Elevación de talones de pie', 'Standing Calf Raise', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['CALVES']),
  createExercise('Elevación de talones sentado', 'Seated Calf Raise', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['CALVES']),
  createExercise('Elevación en prensa', 'Leg Press Calf Raise', MovementPattern.ISOLATION, EquipmentType.LEG_PRESS, false, ['CALVES']),
  createExercise('Elevación unilateral de talones', 'Single-leg Calf Raise', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CALVES']),

  createExercise('Plancha', 'Plank', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CORE']),
  createExercise('Crunch en polea', 'Cable Crunch', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['CORE']),
  createExercise('Ab wheel', 'Ab Wheel Rollout', MovementPattern.ISOLATION, EquipmentType.NONE, false, ['CORE']),
  createExercise('Pallof press', 'Pallof Press', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['CORE']),
  createExercise('Russian twist', 'Russian Twist', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CORE']),
  createExercise('Hanging leg raises', 'Hanging Leg Raises', MovementPattern.ISOLATION, EquipmentType.PULL_UP_BAR, false, ['CORE']),
  createExercise('Dead bug', 'Dead Bug', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CORE']),
  createExercise('Side planks', 'Side Planks', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CORE']),
];

const bonusExercises: SeedExercise[] = [
  createExercise('Farmer carry', 'Farmer Carry', MovementPattern.CARRY, EquipmentType.DUMBBELL, true, ['TRAPS'], ['FOREARMS', 'CORE']),
  createExercise('Suitcase carry', 'Suitcase Carry', MovementPattern.CARRY, EquipmentType.DUMBBELL, true, ['CORE'], ['TRAPS', 'FOREARMS']),
  createExercise('Overhead carry', 'Overhead Carry', MovementPattern.CARRY, EquipmentType.KETTLEBELL, true, ['SHOULDERS'], ['CORE', 'TRAPS']),
  createExercise('Remo invertido', 'Inverted Row', MovementPattern.HORIZONTAL_PULL, EquipmentType.BODYWEIGHT, true, ['BACK'], ['BICEPS']),
  createExercise('Pulldown brazo recto', 'Straight-arm Pulldown', MovementPattern.VERTICAL_PULL, EquipmentType.CABLE, false, ['BACK']),
  createExercise('Remo en máquina pecho apoyado', 'Chest-supported Row', MovementPattern.HORIZONTAL_PULL, EquipmentType.MACHINE, true, ['BACK'], ['BICEPS']),
  createExercise('Press de hombro en máquina', 'Machine Shoulder Press', MovementPattern.VERTICAL_PUSH, EquipmentType.MACHINE, true, ['SHOULDERS'], ['TRICEPS']),
  createExercise('Landmine press', 'Landmine Press', MovementPattern.VERTICAL_PUSH, EquipmentType.BARBELL, true, ['SHOULDERS'], ['CORE']),
  createExercise('Elevación lateral inclinada', 'Lean-away Lateral Raise', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['SHOULDERS']),
  createExercise('Curl inverso con barra', 'Reverse Barbell Curl', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['FOREARMS'], ['BICEPS']),
  createExercise('Curl de muñeca con barra', 'Barbell Wrist Curl', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['FOREARMS']),
  createExercise('Extensión de muñeca con barra', 'Barbell Wrist Extension', MovementPattern.ISOLATION, EquipmentType.BARBELL, false, ['FOREARMS']),
  createExercise('Pronación/supinación con mancuerna', 'Dumbbell Pronation/Supination', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['FOREARMS']),
  createExercise('Encogimiento en máquina', 'Machine Shrug', MovementPattern.CARRY, EquipmentType.MACHINE, true, ['TRAPS']),
  createExercise('Sentadilla en Smith', 'Smith Machine Squat', MovementPattern.SQUAT, EquipmentType.SMITH_MACHINE, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Split squat en Smith', 'Smith Split Squat', MovementPattern.SQUAT, EquipmentType.SMITH_MACHINE, true, ['QUADRICEPS'], ['GLUTES']),
  createExercise('Buenos días en Smith', 'Smith Good Morning', MovementPattern.HIP_HINGE, EquipmentType.SMITH_MACHINE, true, ['HAMSTRINGS'], ['GLUTES', 'BACK']),
  createExercise('RDL con mancuernas', 'Dumbbell Romanian Deadlift', MovementPattern.HIP_HINGE, EquipmentType.DUMBBELL, true, ['HAMSTRINGS'], ['GLUTES']),
  createExercise('Hip thrust en máquina', 'Machine Hip Thrust', MovementPattern.HIP_HINGE, EquipmentType.MACHINE, true, ['GLUTES'], ['HAMSTRINGS']),
  createExercise('Sentadilla Cossack', 'Cossack Squat', MovementPattern.SQUAT, EquipmentType.BODYWEIGHT, true, ['GLUTES'], ['QUADRICEPS']),
  createExercise('Sled push', 'Sled Push', MovementPattern.CARRY, EquipmentType.NONE, true, ['QUADRICEPS'], ['GLUTES', 'CORE']),
  createExercise('Sled pull', 'Sled Pull', MovementPattern.CARRY, EquipmentType.NONE, true, ['BACK'], ['HAMSTRINGS']),
  createExercise('Face pull con banda', 'Band Face Pull', MovementPattern.HORIZONTAL_PULL, EquipmentType.BANDS, false, ['SHOULDERS'], ['TRAPS']),
  createExercise('Pull-aparts con banda', 'Band Pull-aparts', MovementPattern.HORIZONTAL_PULL, EquipmentType.BANDS, false, ['SHOULDERS'], ['BACK']),
  createExercise('Press de pecho en Smith', 'Smith Machine Bench Press', MovementPattern.HORIZONTAL_PUSH, EquipmentType.SMITH_MACHINE, true, ['CHEST'], ['TRICEPS']),
  createExercise('Press inclinado en Smith', 'Smith Machine Incline Press', MovementPattern.HORIZONTAL_PUSH, EquipmentType.SMITH_MACHINE, true, ['CHEST'], ['TRICEPS']),
  createExercise('Pullover con barra EZ', 'EZ Bar Pullover', MovementPattern.VERTICAL_PULL, EquipmentType.EZ_BAR, false, ['BACK']),
  createExercise('Curl Bayesian en cable', 'Bayesian Cable Curl', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['BICEPS']),
  createExercise('JM press', 'JM Press', MovementPattern.HORIZONTAL_PUSH, EquipmentType.BARBELL, true, ['TRICEPS'], ['CHEST']),
  createExercise('Skull crusher con barra EZ', 'EZ Bar Skull Crusher', MovementPattern.ISOLATION, EquipmentType.EZ_BAR, false, ['TRICEPS']),
  createExercise('Abducción con banda', 'Band Hip Abduction', MovementPattern.ISOLATION, EquipmentType.BANDS, false, ['GLUTES']),
  createExercise('Aducción de cadera en máquina', 'Machine Hip Adduction', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['GLUTES']),
  createExercise('Donkey calf raise', 'Donkey Calf Raise', MovementPattern.ISOLATION, EquipmentType.MACHINE, false, ['CALVES']),
  createExercise('Tibialis raise', 'Tibialis Raise', MovementPattern.ISOLATION, EquipmentType.NONE, false, ['CALVES']),
  createExercise('Crunch inverso', 'Reverse Crunch', MovementPattern.ISOLATION, EquipmentType.BODYWEIGHT, false, ['CORE']),
  createExercise('Dragon flag', 'Dragon Flag', MovementPattern.ISOLATION, EquipmentType.BENCH, false, ['CORE'], [], DifficultyLevel.ADVANCED),
  createExercise('Woodchopper en cable', 'Cable Woodchopper', MovementPattern.ISOLATION, EquipmentType.CABLE, false, ['CORE']),
  createExercise('Plancha con arrastre', 'Plank Drag', MovementPattern.ISOLATION, EquipmentType.DUMBBELL, false, ['CORE']),
];

export const DEFAULT_ACHIEVEMENTS: SeedAchievement[] = [
  {
    code: 'FIRST_SESSION',
    titleEs: 'Primera sesión registrada',
    titleEn: 'First Session Logged',
    descriptionEs: 'Completaste y registraste tu primera sesión de entrenamiento.',
    descriptionEn: 'You completed and logged your first training session.',
    iconUrl: 'https://assets.muscula.app/achievements/first-session.svg',
    condition: 'Registrar 1 sesión de entrenamiento',
  },
  {
    code: 'STREAK_7',
    titleEs: '7 días consecutivos',
    titleEn: '7-day Streak',
    descriptionEs: 'Entrenaste 7 días seguidos sin romper la racha.',
    descriptionEn: 'You trained 7 consecutive days without breaking the streak.',
    iconUrl: 'https://assets.muscula.app/achievements/streak-7.svg',
    condition: 'Entrenar durante 7 días consecutivos',
  },
  {
    code: 'FIRST_PR',
    titleEs: 'Nuevo PR',
    titleEn: 'New PR',
    descriptionEs: 'Conseguiste un récord personal en un ejercicio.',
    descriptionEn: 'You achieved a personal record in an exercise.',
    iconUrl: 'https://assets.muscula.app/achievements/first-pr.svg',
    condition: 'Registrar un nuevo récord personal',
  },
  {
    code: 'SESSIONS_25',
    titleEs: '25 sesiones totales',
    titleEn: '25 Total Sessions',
    descriptionEs: 'Alcanzaste 25 sesiones registradas.',
    descriptionEn: 'You reached 25 logged sessions.',
    iconUrl: 'https://assets.muscula.app/achievements/sessions-25.svg',
    condition: 'Registrar 25 sesiones',
  },
  {
    code: 'SESSIONS_100',
    titleEs: '100 sesiones totales',
    titleEn: '100 Total Sessions',
    descriptionEs: 'Alcanzaste 100 sesiones registradas.',
    descriptionEn: 'You reached 100 logged sessions.',
    iconUrl: 'https://assets.muscula.app/achievements/sessions-100.svg',
    condition: 'Registrar 100 sesiones',
  },
  {
    code: 'MESOCYCLE_COMPLETE',
    titleEs: 'Mesociclo completado',
    titleEn: 'Mesocycle Completed',
    descriptionEs: 'Completaste exitosamente un mesociclo.',
    descriptionEn: 'You successfully completed a mesocycle.',
    iconUrl: 'https://assets.muscula.app/achievements/mesocycle-complete.svg',
    condition: 'Completar 1 mesociclo',
  },
  {
    code: 'NUTRITION_STREAK_7',
    titleEs: 'Nutrición en racha',
    titleEn: 'Nutrition Streak',
    descriptionEs: 'Registraste comida 7 días seguidos.',
    descriptionEn: 'You logged meals for 7 consecutive days.',
    iconUrl: 'https://assets.muscula.app/achievements/nutrition-7.svg',
    condition: 'Registrar comidas durante 7 días consecutivos',
  },
  {
    code: 'FIRST_PROGRESS_PHOTO',
    titleEs: 'Primera foto de progreso',
    titleEn: 'First Progress Photo',
    descriptionEs: 'Subiste tu primera foto de progreso.',
    descriptionEn: 'You uploaded your first progress photo.',
    iconUrl: 'https://assets.muscula.app/achievements/first-photo.svg',
    condition: 'Subir 1 foto de progreso',
  },
  {
    code: 'WEIGHT_LOGGER_30',
    titleEs: '30 días pesándote',
    titleEn: '30-day Weight Logger',
    descriptionEs: 'Registraste tu peso corporal durante 30 días.',
    descriptionEn: 'You logged body weight for 30 days.',
    iconUrl: 'https://assets.muscula.app/achievements/weight-30.svg',
    condition: 'Registrar peso corporal 30 días',
  },
  {
    code: 'CONSISTENCY_12_WEEKS',
    titleEs: 'Consistencia 12 semanas',
    titleEn: '12-week Consistency',
    descriptionEs: 'Mantuviste consistencia de entrenamiento por 12 semanas.',
    descriptionEn: 'You maintained training consistency for 12 weeks.',
    iconUrl: 'https://assets.muscula.app/achievements/consistency-12.svg',
    condition: 'Entrenar al menos 3 veces por semana durante 12 semanas',
  },
];

export const DEFAULT_VOLUME_LANDMARKS: VolumeLandmarkDefault[] = [
  { muscleGroup: 'CHEST', mev: 8, mrv: 22 },
  { muscleGroup: 'BACK', mev: 8, mrv: 25 },
  { muscleGroup: 'SHOULDERS', mev: 6, mrv: 26 },
  { muscleGroup: 'BICEPS', mev: 4, mrv: 20 },
  { muscleGroup: 'TRICEPS', mev: 4, mrv: 18 },
  { muscleGroup: 'QUADRICEPS', mev: 6, mrv: 20 },
  { muscleGroup: 'HAMSTRINGS', mev: 4, mrv: 20 },
  { muscleGroup: 'GLUTES', mev: 0, mrv: 16 },
  { muscleGroup: 'CALVES', mev: 6, mrv: 20 },
  { muscleGroup: 'CORE', mev: 0, mrv: 16 },
  { muscleGroup: 'TRAPS', mev: 0, mrv: 14 },
  { muscleGroup: 'FOREARMS', mev: 0, mrv: 12 },
];

const PRESET_EQUIPMENT_PROFILES: Array<{
  name: string;
  equipment: EquipmentType[];
}> = [
  {
    name: 'Gimnasio Comercial Completo',
    equipment: [
      EquipmentType.BARBELL,
      EquipmentType.DUMBBELL,
      EquipmentType.CABLE,
      EquipmentType.MACHINE,
      EquipmentType.KETTLEBELL,
      EquipmentType.EZ_BAR,
      EquipmentType.SMITH_MACHINE,
      EquipmentType.PULL_UP_BAR,
      EquipmentType.DIP_STATION,
      EquipmentType.BENCH,
      EquipmentType.LEG_PRESS,
      EquipmentType.HACK_SQUAT,
      EquipmentType.BANDS,
      EquipmentType.BODYWEIGHT,
    ],
  },
  {
    name: 'Home Gym Básico',
    equipment: [
      EquipmentType.BARBELL,
      EquipmentType.DUMBBELL,
      EquipmentType.BENCH,
      EquipmentType.BANDS,
      EquipmentType.BODYWEIGHT,
      EquipmentType.PULL_UP_BAR,
    ],
  },
  {
    name: 'Solo Peso Corporal',
    equipment: [EquipmentType.BODYWEIGHT, EquipmentType.NONE],
  },
];

export const buildExerciseCatalog = (): SeedExercise[] => {
  const uniqueByName = new Map<string, SeedExercise>();

  [...requiredExercisesBase, ...bonusExercises].forEach((exercise) => {
    uniqueByName.set(exercise.nameEs, exercise);
  });

  const catalog = Array.from(uniqueByName.values());
  const baseLength = catalog.length;

  let index = 0;
  while (catalog.length < MIN_EXERCISE_COUNT) {
    const source = catalog[index % baseLength];
    const variationIndex = Math.floor(index / baseLength) + 1;

    catalog.push({
      ...source,
      nameEs: `${source.nameEs} - Variante técnica ${variationIndex}`,
      nameEn: `${source.nameEn} - Technical Variation ${variationIndex}`,
      difficulty:
        variationIndex % 2 === 0
          ? DifficultyLevel.ADVANCED
          : source.difficulty,
    });

    index += 1;
  }

  return catalog;
};

export const seedDatabase = async (
  prisma: PrismaClient,
): Promise<{ exercisesInserted: number; achievementsSeeded: number }> => {
  const exerciseCatalog = buildExerciseCatalog();

  const existingExercises = await prisma.exercise.findMany({
    select: { nameEs: true },
  });

  const existingNames = new Set(existingExercises.map((exercise) => exercise.nameEs));
  const exercisesToInsert = exerciseCatalog.filter(
    (exercise) => !existingNames.has(exercise.nameEs),
  );

  for (const exercise of exercisesToInsert) {
    await prisma.exercise.create({
      data: {
        nameEs: exercise.nameEs,
        nameEn: exercise.nameEn,
        movementPattern: exercise.movementPattern,
        difficulty: exercise.difficulty,
        equipmentType: exercise.equipmentType,
        isCompound: exercise.isCompound,
        isCustom: false,
        primaryMuscles: {
          create: exercise.primaryMuscles.map((muscleGroup) => ({ muscleGroup })),
        },
        secondaryMuscles: {
          create: exercise.secondaryMuscles.map((muscleGroup) => ({ muscleGroup })),
        },
        equipmentNeeded: {
          create: [{ equipment: exercise.equipmentType }],
        },
      },
    });
  }

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      create: achievement,
      update: {
        titleEs: achievement.titleEs,
        titleEn: achievement.titleEn,
        descriptionEs: achievement.descriptionEs,
        descriptionEn: achievement.descriptionEn,
        iconUrl: achievement.iconUrl,
        condition: achievement.condition,
      },
    });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  for (const user of users) {
    const existingProfiles = await prisma.equipmentProfile.findMany({
      where: {
        userId: user.id,
        isPreset: true,
      },
      include: { equipment: true },
    });

    for (const preset of PRESET_EQUIPMENT_PROFILES) {
      const existingProfile = existingProfiles.find(
        (profile) => profile.name === preset.name,
      );

      if (existingProfile === undefined) {
        await prisma.equipmentProfile.create({
          data: {
            userId: user.id,
            name: preset.name,
            isPreset: true,
            isActive: false,
            equipment: {
              createMany: {
                data: preset.equipment.map((equipment) => ({ equipment })),
              },
            },
          },
        });
      } else {
        await prisma.profileEquipmentItem.deleteMany({
          where: { equipmentProfileId: existingProfile.id },
        });

        await prisma.profileEquipmentItem.createMany({
          data: preset.equipment.map((equipment) => ({
            equipmentProfileId: existingProfile.id,
            equipment,
          })),
        });
      }
    }

    const hasActiveProfile = await prisma.equipmentProfile.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: { id: true },
    });

    if (hasActiveProfile === null) {
      const profileToActivate = await prisma.equipmentProfile.findFirst({
        where: {
          userId: user.id,
          name: 'Gimnasio Comercial Completo',
          isPreset: true,
        },
        select: { id: true },
      });

      if (profileToActivate !== null) {
        await prisma.equipmentProfile.update({
          where: { id: profileToActivate.id },
          data: { isActive: true },
        });
      }
    }

    for (const landmark of DEFAULT_VOLUME_LANDMARKS) {
      await prisma.userVolumeLandmark.upsert({
        where: {
          userId_muscleGroup: {
            userId: user.id,
            muscleGroup: landmark.muscleGroup,
          },
        },
        create: {
          userId: user.id,
          muscleGroup: landmark.muscleGroup,
          mev: landmark.mev,
          mrv: landmark.mrv,
        },
        update: {
          mev: landmark.mev,
          mrv: landmark.mrv,
        },
      });
    }
  }

  return {
    exercisesInserted: exercisesToInsert.length,
    achievementsSeeded: DEFAULT_ACHIEVEMENTS.length,
  };
};

const main = async (): Promise<void> => {
  const prisma = new PrismaClient();

  try {
    const result = await seedDatabase(prisma);
    console.info(
      `Seed completado. Ejercicios insertados: ${result.exercisesInserted}. Logros procesados: ${result.achievementsSeeded}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  });
}
