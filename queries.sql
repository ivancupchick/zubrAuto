SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone="+00:00";

CREATE TABLE `carForms` (
    `id` int(11) NOT NULL,
    `content` varchar(255) NOT NULL,
    `carId` int(11) NOT NULL
);

CREATE TABLE `carOwners` (
    `id` int(11) NOT NULL,
    `number` varchar(255)
);

CREATE TABLE `carStatistic` (
    `id` int(11) NOT NULL,
    `content` varchar(255),
    `carId` int(11) NOT NULL,
    `type` int(11) NOT NULL,
    `date` bigint NOT NULL
);

CREATE TABLE `cars` (
    `id` int(11) NOT NULL,
    `createdDate` varchar(255) NOT NULL,
    `ownerId` int(11) NOT NULL
);

CREATE TABLE `clients` (
    `id` int(11) NOT NULL,
    `carIds` varchar(255) NOT NULL
);

CREATE TABLE `fieldAccesses` (
    `id` int(11) NOT NULL,
    `fieldId` int(11) NOT NULL,
    `sourceId` int(11) NOT NULL,
    `sourceName` varchar(255) NOT NULL,
    `access` int(11) NOT NULL
);

CREATE TABLE `fieldIds` (
    `id` int(11) NOT NULL,
    `sourceId` int(11) NOT NULL,
    `fieldId` int(11) NOT NULL,
    `value` varchar(255),
    `sourceName` varchar(255)
);

CREATE TABLE `fields` (
    `id` int(11) NOT NULL,
    `flags` int(11) NOT NULL,
    `type` int(11) NOT NULL,
    `domain` int(11) NOT NULL,
    `variants` varchar(255) NOT NULL,
    `showUserLevel` int(11) NOT NULL,
    `name` varchar(255)
);

CREATE TABLE `files` (
    `id` int(11) NOT NULL,
    `url` varchar(255) NOT NULL,
    `type` int(11) NOT NULL,
    `parent` int(11),
    `name` varchar(255),
    `fileMetadata` varchar(255)
);

CREATE TABLE `filesIds` (
    `id` int(11) NOT NULL,
    `sourceId` int(11) NOT NULL,
    `fileId` int(11) NOT NULL,
    `sourceName` varchar(255)
);

CREATE TABLE `forms` (
    `id` int(11) NOT NULL,
    `flags` int(11) NOT NULL
);

CREATE TABLE `roles` (
    `id` int(11) NOT NULL,
    `systemName` varchar(255) NOT NULL
);

CREATE TABLE `userTokens` (
    `id` int(11) NOT NULL,
    `userId` int(11) NOT NULL,
    `refreshToken` varchar(255) NOT NULL
);

CREATE TABLE `users` (
    `id` int(11) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `isActivated` boolean DEFAULT 0,
    `activationLink` varchar(255),
    `roleLevel` int(11) NOT NULL
);

CREATE TABLE `activities` (
  `id` int(11),
  `userId` int(11),
  `sourceId` int(11),
  `sourceName` varchar(255),
  `date` bigint,
  `activities` longtext
);

CREATE TABLE `phoneCalls` (
  `id` int(11) NOT NULL,
  `originalNotifications` varchar(255) NOT NULL,
  `innerNumber` varchar(15) NOT NULL,
  `clientNumber` varchar(15) NOT NULL,
  `createdDate` bigint NOT NULL,
  `userId` int(11),
  `originalDate` varchar(255) NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(255),
  `isFinished` boolean DEFAULT 0,
  `recordUrl` varchar(255),
);

ALTER TABLE `carForms`
    ADD CONSTRAINT carForms_pk PRIMARY KEY (`id`);
ALTER TABLE `carOwners`
    ADD CONSTRAINT carOwners_pk PRIMARY KEY (`id`);
ALTER TABLE `carStatistic`
    ADD CONSTRAINT carStatistic_pk PRIMARY KEY (`id`);
ALTER TABLE `cars`
    ADD CONSTRAINT cars_pk PRIMARY KEY (`id`);
ALTER TABLE `clients`
    ADD CONSTRAINT clients_pk PRIMARY KEY (`id`);
ALTER TABLE `fieldAccesses`
    ADD CONSTRAINT fieldAccesses_pk PRIMARY KEY (`id`);
ALTER TABLE `fieldIds`
    ADD CONSTRAINT fieldIds_pk PRIMARY KEY (`id`);
ALTER TABLE `fields`
    ADD CONSTRAINT fields_pk PRIMARY KEY (`id`);
ALTER TABLE `filesIds`
    ADD CONSTRAINT filesIds_pk PRIMARY KEY (`id`);
ALTER TABLE `files`
    ADD CONSTRAINT files_pk PRIMARY KEY (`id`);
ALTER TABLE `forms`
    ADD CONSTRAINT forms_pk PRIMARY KEY (`id`);
ALTER TABLE `users`
    ADD CONSTRAINT users_pk PRIMARY KEY (`id`);
ALTER TABLE `roles`
    ADD CONSTRAINT roles_pk PRIMARY KEY (`id`);
ALTER TABLE `userTokens`
    ADD CONSTRAINT users_pk PRIMARY KEY (`id`);
ALTER TABLE `phoneCalls`
    ADD CONSTRAINT phoneCalls_pk PRIMARY KEY (`id`);

CREATE INDEX fieldIds_FIND_INDEX ON fieldIds (sourceName, sourceId, fieldId);
CREATE INDEX fieldIds_FIND_INDEX_BY_VALUE ON fieldIds (sourceName, fieldId, value);
CREATE INDEX phoneCalls_FIND_INDEX ON phoneCalls (innerNumber, clientNumber);

ALTER TABLE `activities`
  ADD CONSTRAINT FOREIGN KEY `fk_userId` (`userId`)
    REFERENCES `users` (`id`);

ALTER TABLE `cars`
  ADD CONSTRAINT FOREIGN KEY `fk_ownerId` (`ownerId`)
    REFERENCES `carOwners` (`id`);


ALTER TABLE `fieldIds`
  ADD CONSTRAINT FOREIGN KEY `fk_fieldId` (`fieldId`)
    REFERENCES `fields` (`id`);


ALTER TABLE `fieldAccesses`
  ADD CONSTRAINT FOREIGN KEY `fk_fieldId` (`fieldId`)
    REFERENCES `fields` (`id`);

ALTER TABLE `filesIds`
  ADD CONSTRAINT FOREIGN KEY `fk_fileId` (`fileId`)
    REFERENCES `files` (`id`);

ALTER TABLE `carStatistic`
  ADD CONSTRAINT FOREIGN KEY `fk_carId` (`carId`)
    REFERENCES `cars` (`id`);

ALTER TABLE `carForms`
  ADD CONSTRAINT `fk_carId` FOREIGN KEY (`carId`)
  REFERENCES `cars` (`id`);


-- clear all car data TODO
TRUNCATE TABLE cars;
TRUNCATE TABLE carForms;
TRUNCATE TABLE clients;
