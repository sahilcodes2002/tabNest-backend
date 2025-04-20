-- CreateTable
CREATE TABLE "ManTab" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "folder_id" INTEGER NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "favIconUrl" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "tabid" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "important" BOOLEAN,
    "archive" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManFolder" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "color" INTEGER,
    "archive" BOOLEAN,
    "default" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManTab_user_id_idx" ON "ManTab"("user_id");

-- CreateIndex
CREATE INDEX "ManTab_folder_id_idx" ON "ManTab"("folder_id");

-- CreateIndex
CREATE INDEX "ManFolder_user_id_idx" ON "ManFolder"("user_id");

-- AddForeignKey
ALTER TABLE "ManTab" ADD CONSTRAINT "ManTab_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManTab" ADD CONSTRAINT "ManTab_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "ManFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManFolder" ADD CONSTRAINT "ManFolder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
