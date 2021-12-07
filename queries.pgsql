/*
	CREATE
*/

CREATE TABLE "public.cars" (
	"id" serial NOT NULL,
	"createdDate" VARCHAR(255) NOT NULL,
	"ownerId" integer NOT NULL,
	CONSTRAINT "cars_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("ownerId") REFERENCES "public.carOwners" ("id")
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
  "parent" integer,
	CONSTRAINT "files_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.filesIds" (
	"id" serial NOT NULL,
	"sourceId" integer NOT NULL,
	"fileId" integer NOT NULL,
	CONSTRAINT "filesIds_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("fileId") REFERENCES "public.files" ("id")
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
	CONSTRAINT "fieldIds_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("fieldId") REFERENCES "public.fields" ("id")
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
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "isActivated" boolean DEFAULT FALSE,
  "activationLink" VARCHAR(255),
	"roleLevel" integer NOT NULL
  CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public.userTokens" (
	"id" serial NOT NULL,
	"userId" integer NOT NULL,
  "refreshToken" VARCHAR(255) NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "public.users" ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public.roles" (
	"id" serial NOT NULL,
	"systemName" VARCHAR(255) NOT NULL,
	CONSTRAINT "roles_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public.fieldAccesses" (
	"id" serial NOT NULL,
	"fieldId" integer NOT NULL,
	"sourceId" integer NOT NULL,
	"sourceName" VARCHAR(255) NOT NULL,
	"access" integer NOT NULL,
	CONSTRAINT "fieldAccesses_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("fieldId") REFERENCES "public.fields" ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public.carForms" (
	"id" serial NOT NULL,
	"content" VARCHAR NOT NULL,
	"carId" integer NOT NULL,
  CONSTRAINT "carForms_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("carId") REFERENCES "public.cars" ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "public.carStatistic" (
	"id" serial NOT NULL,
	"content" VARCHAR,
	"carId" integer NOT NULL,
  "type" integer NOT NULL,
  "date" integer NOT NULL,
  CONSTRAINT "carStatistic_pk" PRIMARY KEY ("id"),
  FOREIGN KEY ("carId") REFERENCES "public.cars" ("id")
) WITH (
  OIDS=FALSE
);


/*
	add column
*/

ALTER TABLE "public.fieldIds"
ADD COLUMN "value" VARCHAR(255);

/**
  change type
*/

ALTER TABLE "public.userTokens"
ALTER COLUMN "refreshToken" TYPE VARCHAR;
