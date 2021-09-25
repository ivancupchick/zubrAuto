/*
	CREATE
*/

CREATE TABLE "public.cars" (
	"id" serial NOT NULL,
	"createdDate" VARCHAR(255) NOT NULL,
	"ownerId" integer NOT NULL,
	CONSTRAINT "cars_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.carOwners" (
	"id" serial NOT NULL,
	CONSTRAINT "carOwners_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.forms" (
	"id" serial NOT NULL,
	"flags" integer NOT NULL,
	CONSTRAINT "forms_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.files" (
	"id" serial NOT NULL,
	"url" VARCHAR(255) NOT NULL,
	"type" integer NOT NULL,
	CONSTRAINT "files_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.filesIds" (
	"id" serial NOT NULL,
	"sourceId" integer NOT NULL,
	"fileId" integer NOT NULL,
	CONSTRAINT "filesIds_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.fields" (
	"id" serial NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"flags" integer NOT NULL,
	"type" integer NOT NULL,
	"domain" integer NOT NULL,
	"variants" VARCHAR(255) NOT NULL,
	"showUserLevel" integer NOT NULL,
	CONSTRAINT "fields_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.fieldIds" (
	"id" serial NOT NULL,
	"sourceId" integer NOT NULL,
	"fieldId" integer NOT NULL,
	CONSTRAINT "fieldIds_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.clients" (
	"id" serial NOT NULL,
	"carIds" VARCHAR(255) NOT NULL,
	CONSTRAINT "clients_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.users" (
	"id" serial NOT NULL,
	"roleLevel" integer NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

/*
	add column
*/

ALTER TABLE "public.fieldIds"
ADD COLUMN "value" VARCHAR(255);
