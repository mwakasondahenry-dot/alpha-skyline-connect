// The four school admission forms as data. This is the single source of the
// forms' wording: the PDF layout, the wizard and the Admission page all read
// from here. Labels and paragraphs follow the school's own PDFs in
// design/admission-forms/, with three deliberate fixes: the website is
// www.alphaschools.co.tz (not .ac.tz), "KNOWLEDGE" is spelled correctly and
// "PSLE" replaces the source's "PLSE".

export type FormId =
  "alpha-high-form-1" | "alpha-girls-form-1" | "alpha-high-transfer" | "alpha-girls-transfer";
export type FieldKind = "text" | "date" | "phone" | "email" | "gender";
/** width = share of a 3-column row on the PDF */
export type Field = { key: string; label: string; kind: FieldKind; width: 1 | 2 | 3 };
/** One numbered line of the source form. */
export type Question = { n: number; fields: Field[] };
export type Part = { title: string; questions: Question[] };
export type WizardStep = "pupil" | "parents" | "school";
export type FormDef = {
  id: FormId;
  school: "alpha-high" | "alpha-girls";
  kind: "form-1" | "transfer";
  schoolName: string;
  shortName: string;
  title: string;
  entryClass: string | null;
  entryFields: Field[];
  headerLines: string[];
  crest: "alpha-high.jpg" | "alpha-schools.jpg";
  partA: Part;
  partB: Part;
  steps: Record<WizardStep, string[]>;
  partC: string[];
  partD: string;
  hasPartE: boolean;
  blankPdfPath: string;
};

type School = FormDef["school"];
type Kind = FormDef["kind"];

const WEBSITE_LINE = "Website: www.alphaschools.co.tz   E-mail: alphaschoolsdsm@alphaschools.co.tz";

function f(key: string, label: string, width: Field["width"], kind: FieldKind = "text"): Field {
  return { key, label, kind, width };
}

function nameFields(who: string): Field[] {
  return [
    f("firstName", `${who}'s Name: First Name`, 1),
    f("middleName", "Middle Name", 1),
    f("familyName", "Family Name", 1),
  ];
}

function parentFields(prefix: "father" | "mother", nameLabel: string): Field[] {
  return [
    f(`${prefix}Name`, nameLabel, 3),
    f(`${prefix}Occupation`, "Occupation", 1),
    f(`${prefix}Work`, "Place of Work", 1),
    f(`${prefix}Tel`, "Tel", 1, "phone"),
  ];
}

function buildPartA(school: School, kind: Kind): Part {
  const girlsForm1 = school === "alpha-girls" && kind === "form-1";
  const who = kind === "form-1" ? "Pupil" : "Student";
  const denomination = girlsForm1 ? "Denomination/ Section" : "Denomination/ Sect";
  const fatherLabel = girlsForm1 ? "Name of the Father/Guardian" : "Name of Father/Guardian";

  const birth = [
    f("birthPlace", "Place of Birth", 1),
    f("birthDistrict", "District", 1),
    f("birthRegion", "Region", 1),
  ];
  const nationality = f("nationality", "Nationality", girlsForm1 ? 1 : 3);

  const lines: Field[][] = [
    nameFields(who),
    [f("dob", "Date of Birth", 2, "date"), f("gender", "Gender", 1, "gender")],
    girlsForm1 ? [...birth, nationality] : birth,
    ...(girlsForm1 ? [] : [[nationality]]),
    [
      f("residence", "Place of Residence", 1),
      f("residenceDistrict", "District", 1),
      f("residenceRegion", "Region", 1),
    ],
    [f("postalAddress", "Postal Address", 1), f("email", "Email", 2, "email")],
    [f("religion", "Religion", 1), f("denomination", denomination, 2)],
    parentFields("father", fatherLabel),
    parentFields("mother", "Name of Mother/Guardian"),
  ];

  return {
    title: `PART A: PARTICULARS OF THE ${who.toUpperCase()}`,
    questions: lines.map((fields, i) => ({ n: i + 1, fields })),
  };
}

function buildPartB(school: School, kind: Kind): Part {
  const location = (label: string): Field[] => [
    f("prevLocation", label, 1),
    f("prevDistrict", "District", 1),
    f("prevRegion", "Region", 1),
  ];

  if (kind === "form-1") {
    const lines: Field[][] = [
      nameFields("Pupil"),
      [f("indexNumber", "Pupil's Index Number: PS", 3)],
      [f("prem", "PREM NUMBER", 3)],
      [f("prevContact", "Previous school contact", 3, "phone")],
      [f("std7Year", "Year of Completion of Standard Seven", 3)],
      [f("prevSchool", "Name of School", 3)],
      location("School Location"),
    ];
    return {
      title: "PART B: PARTICULARS OF PRIMARY SCHOOL",
      questions: lines.map((fields, i) => ({ n: i + 1, fields })),
    };
  }

  const girls = school === "alpha-girls";
  const lines: Field[][] = [
    nameFields("Student"),
    [f("examNumber", "Student's PSLE/FTNA/CSEE number", 3)],
    [f("prem", girls ? "PREM NUMBER" : "PREM Number", 3)],
    [f("prevSchool", girls ? "Previous school name" : "School name", 3)],
    [f("prevContact", "Previous school contact", 3, "phone")],
    location(girls ? "Previous School Location" : "School Location"),
  ];
  return {
    title: "PART B: PARTICULARS OF PREVIOUS SCHOOL",
    questions: lines.map((fields, i) => ({ n: i + 1, fields })),
  };
}

function keysOf(questions: Question[]): string[] {
  return questions.flatMap((q) => q.fields.map((field) => field.key));
}

function buildSteps(
  entryFields: Field[],
  partA: Part,
  partB: Part,
  pupilQuestions: number,
): Record<WizardStep, string[]> {
  const pupil = [
    ...entryFields.map((field) => field.key),
    ...keysOf(partA.questions.filter((q) => q.n <= pupilQuestions)),
  ];
  const parents = keysOf(partA.questions.filter((q) => q.n > pupilQuestions));
  // Part B question 1 repeats the name already asked on the pupil step.
  const school = keysOf(partB.questions.filter((q) => q.n > 1));
  return { pupil, parents, school };
}

function buildPartC(school: School, kind: Kind): string[] {
  const girls = school === "alpha-girls";
  const child = kind === "transfer" && !girls ? "student" : "child";
  const itemsIntro = [
    "1. Return this form duly filled together with the following items:",
    "i) Copy of birth certificate",
    `ii) Two recent passport size of the ${child}`,
  ];

  if (kind === "form-1") {
    return [
      ...itemsIntro,
      "iii) Standard six and seven results (to be filled under PART E of this form)",
      girls
        ? "2. Entrance examination subjects will be ENGLISH, MATHEMATICS, and GENERAL KNOWLEDGE & SCIENCE."
        : "2. Entrance examination subjects will be ENGLISH, MATHEMATICS, GENERAL KNOWLEDGE.",
      `3. Date of interview will be on ____________ from 08:00am at ${
        girls ? "Alpha Girls High School – KUNDUCHI" : "Alpha High School – MIKOCHENI"
      }`,
      "NOTE: Interviews will be conducted ONLY on Fridays and Saturdays from 12th September onwards.",
    ];
  }

  return [
    ...itemsIntro,
    girls ? "iii) Result slip (For A-Level)" : "iii) Results slip (For A-Level)",
    "2. Entrance examination subjects will be ALL SUBJECTS TAKEN IN CLASS OF ADMISSION.",
    girls
      ? "3. Date of interview will be on ____________ from 08:00am at Alpha Girls High School – KUNDUCHI"
      : "3. Date of Examination will be on ____________ from 08:00 am at Alpha High School – Mikocheni.",
  ];
}

function buildPartD(id: FormId): string {
  const word = id === "alpha-high-transfer" ? "student" : "pupil";
  return `I declare that the above information is true and correct. I understand that any false information traced at any time, including during the ${word}'s stay at school, could result in the immediate removal of the ${word} from school.`;
}

const HEADER_LINES: Record<FormId, string[]> = {
  "alpha-high-form-1": [
    "P. O. Box 35136, Dar es Salaam, Tanzania. Mikocheni B Industrial Area",
    "Head of School: 0755524961, 0739 924 500, Academic Office: 0672833974",
    "Manager: 0734036010; 0784848686; 0653312438; 0716902995.",
  ],
  "alpha-high-transfer": [
    "P. O. Box 35136, Dar es Salaam, Tanzania. Mikocheni B Industrial Area",
    "Head of School: 0787239803, Academic Supervisor: 0713642873",
    "Manager: 0734 036 010; 0784 848 686",
  ],
  "alpha-girls-form-1": [
    "P. O. Box 35136, Dar es Salaam, Tanzania. Kunduchi, Seamic Road.",
    "Head of School: 0734 063 653  Administration: 0734 036 704  Academic Office 0756299302",
    "Manager: 0734036010, 0784848686, 0653312438",
  ],
  "alpha-girls-transfer": [
    "P. O. Box 35136, Dar es Salaam, Tanzania. Kunduchi, Seamic Road.",
    "Head of School: 0755 848 142/0734 063 653  Administration: 0734 036 704  Academic Office 0719376409",
    "Manager: 0734036010, 0784848686, 0653312438",
  ],
};

function buildForm(school: School, kind: Kind): FormDef {
  const id = `${school}-${kind}` as FormId;
  const girls = school === "alpha-girls";
  const entryFields: Field[] =
    kind === "transfer"
      ? [
          f("entryForm", "Entry Class: Form", 1),
          f("combination", "Bias/Combination", 1),
          f("entryYear", "Year", 1),
        ]
      : [];
  const partA = buildPartA(school, kind);
  const partB = buildPartB(school, kind);

  return {
    id,
    school,
    kind,
    schoolName: girls ? "ALPHA GIRLS' HIGH SCHOOL" : "ALPHA HIGH SCHOOL",
    shortName: girls ? "Alpha Girls" : "Alpha High",
    title: kind === "form-1" ? "APPLICATION FORM FOR ADMISSION" : "TRANSFER APPLICATION FORM",
    entryClass: kind === "form-1" ? "FORM I 2027" : null,
    entryFields,
    headerLines: [...HEADER_LINES[id], WEBSITE_LINE],
    crest: girls ? "alpha-schools.jpg" : "alpha-high.jpg",
    partA,
    partB,
    steps: buildSteps(entryFields, partA, partB, girls && kind === "form-1" ? 6 : 7),
    partC: buildPartC(school, kind),
    partD: buildPartD(id),
    hasPartE: kind === "form-1",
    blankPdfPath: `/forms/${id}.pdf`,
  };
}

export const FORMS: FormDef[] = [
  buildForm("alpha-high", "form-1"),
  buildForm("alpha-girls", "form-1"),
  buildForm("alpha-high", "transfer"),
  buildForm("alpha-girls", "transfer"),
];

export function getForm(id: string): FormDef | undefined {
  return FORMS.find((form) => form.id === id);
}
