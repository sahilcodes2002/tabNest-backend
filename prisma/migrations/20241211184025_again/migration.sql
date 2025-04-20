-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private" BOOLEAN NOT NULL,
    "notifications" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emailwithcode" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Emailwithcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "color" INTEGER,
    "archive" BOOLEAN,
    "default" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "default" BOOLEAN,
    "url" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tab" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "folder_id" INTEGER NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "important" BOOLEAN,
    "archive" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderInvite" (
    "id" SERIAL NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "important" BOOLEAN,

    CONSTRAINT "FolderInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TabTags" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "TabTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderTags" (
    "id" SERIAL NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "FolderTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Emailwithcode_email_key" ON "Emailwithcode"("email");

-- CreateIndex
CREATE INDEX "Folder_user_id_idx" ON "Folder"("user_id");

-- CreateIndex
CREATE INDEX "Note_user_id_idx" ON "Note"("user_id");

-- CreateIndex
CREATE INDEX "Tab_user_id_idx" ON "Tab"("user_id");

-- CreateIndex
CREATE INDEX "Tab_folder_id_idx" ON "Tab"("folder_id");

-- CreateIndex
CREATE INDEX "TabTags_project_id_idx" ON "TabTags"("project_id");

-- CreateIndex
CREATE INDEX "FolderTags_folder_id_idx" ON "FolderTags"("folder_id");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tab" ADD CONSTRAINT "Tab_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tab" ADD CONSTRAINT "Tab_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderInvite" ADD CONSTRAINT "FolderInvite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderInvite" ADD CONSTRAINT "FolderInvite_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabTags" ADD CONSTRAINT "TabTags_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Tab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderTags" ADD CONSTRAINT "FolderTags_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
