-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "kweyolWord" TEXT NOT NULL,
    "englishTranslation" TEXT NOT NULL,
    "alternativeEnglish" TEXT,
    "partOfSpeech" TEXT,
    "pronunciationGuide" TEXT,
    "simpleDefinition" TEXT,
    "detailedDefinition" TEXT,
    "grammaticalNotes" TEXT,
    "usageNotes" TEXT,
    "culturalNotes" TEXT,
    "pluralForm" TEXT,
    "verbForms" TEXT,
    "alternativeSpelling" TEXT,
    "formalityLevel" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "ageSuitability" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "audience" TEXT NOT NULL DEFAULT 'BOTH',
    "topicCategory" TEXT,
    "sourceOrContributor" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "regionalWarning" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isWordOfDayEligible" BOOLEAN NOT NULL DEFAULT true,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLastReviewed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "editorId" TEXT,
    CONSTRAINT "DictionaryEntry_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdultPresentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "displayDefinition" TEXT,
    "learningNotes" TEXT,
    "showInPublicDictionary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdultPresentation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildPresentation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "simpleMeaning" TEXT NOT NULL,
    "shortExampleKweyol" TEXT,
    "shortExampleEnglish" TEXT,
    "funFact" TEXT,
    "culturalFact" TEXT,
    "ageBand" TEXT NOT NULL DEFAULT 'EARLY_4_6',
    "childCategoryKey" TEXT,
    "showInChildrenDictionary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChildPresentation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExampleSentence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "kweyolText" TEXT NOT NULL,
    "englishText" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "audience" TEXT NOT NULL DEFAULT 'ADULT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExampleSentence_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromEntryId" TEXT NOT NULL,
    "toEntryId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    CONSTRAINT "WordRelation_fromEntryId_fkey" FOREIGN KEY ("fromEntryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WordRelation_toEntryId_fkey" FOREIGN KEY ("toEntryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameKweyol" TEXT,
    "description" TEXT,
    "audience" TEXT NOT NULL DEFAULT 'BOTH',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntryCategory" (
    "entryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("entryId", "categoryId"),
    CONSTRAINT "EntryCategory_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MISSING',
    "isVerifiedNative" BOOLEAN NOT NULL DEFAULT false,
    "transcript" TEXT,
    "audience" TEXT NOT NULL DEFAULT 'BOTH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AudioAsset_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT,
    "categoryKey" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLACEHOLDER',
    "aspectRatio" TEXT NOT NULL DEFAULT '1:1',
    "generationBrief" TEXT,
    "audience" TEXT NOT NULL DEFAULT 'CHILD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImageAsset_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrammarLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortExplanation" TEXT NOT NULL,
    "examplesJson" TEXT NOT NULL,
    "commonMistakes" TEXT,
    "practiceActivity" TEXT,
    "pronunciationSupport" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audience" TEXT NOT NULL DEFAULT 'ADULT',
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityType" TEXT NOT NULL,
    "ageBand" TEXT NOT NULL DEFAULT 'EARLY_4_6',
    "categoryKey" TEXT,
    "configJson" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Favourite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favourite_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunitySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payloadJson" TEXT NOT NULL,
    "submitterNote" TEXT,
    "submitterEmail" TEXT,
    "reviewerId" TEXT,
    "contributorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunitySubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CommunitySubmission_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangeHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChangeHistory_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "detailJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditorialNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_slug_key" ON "DictionaryEntry"("slug");

-- CreateIndex
CREATE INDEX "DictionaryEntry_kweyolWord_idx" ON "DictionaryEntry"("kweyolWord");

-- CreateIndex
CREATE INDEX "DictionaryEntry_englishTranslation_idx" ON "DictionaryEntry"("englishTranslation");

-- CreateIndex
CREATE INDEX "DictionaryEntry_reviewStatus_idx" ON "DictionaryEntry"("reviewStatus");

-- CreateIndex
CREATE INDEX "DictionaryEntry_partOfSpeech_idx" ON "DictionaryEntry"("partOfSpeech");

-- CreateIndex
CREATE INDEX "DictionaryEntry_difficulty_idx" ON "DictionaryEntry"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "AdultPresentation_entryId_key" ON "AdultPresentation"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildPresentation_entryId_key" ON "ChildPresentation"("entryId");

-- CreateIndex
CREATE INDEX "ChildPresentation_ageBand_idx" ON "ChildPresentation"("ageBand");

-- CreateIndex
CREATE INDEX "ChildPresentation_childCategoryKey_idx" ON "ChildPresentation"("childCategoryKey");

-- CreateIndex
CREATE INDEX "ExampleSentence_entryId_idx" ON "ExampleSentence"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "WordRelation_fromEntryId_toEntryId_relationType_key" ON "WordRelation"("fromEntryId", "toEntryId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "Category_key_key" ON "Category"("key");

-- CreateIndex
CREATE INDEX "AudioAsset_entryId_idx" ON "AudioAsset"("entryId");

-- CreateIndex
CREATE INDEX "AudioAsset_status_idx" ON "AudioAsset"("status");

-- CreateIndex
CREATE INDEX "ImageAsset_entryId_idx" ON "ImageAsset"("entryId");

-- CreateIndex
CREATE INDEX "ImageAsset_status_idx" ON "ImageAsset"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarLesson_slug_key" ON "GrammarLesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_slug_key" ON "Quiz"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChildActivity_slug_key" ON "ChildActivity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Favourite_entryId_clientKey_key" ON "Favourite"("entryId", "clientKey");

-- CreateIndex
CREATE INDEX "ChangeHistory_entityType_entityId_idx" ON "ChangeHistory"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EditorialNote_key_key" ON "EditorialNote"("key");
