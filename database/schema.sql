--
-- Prepare
--

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

DROP TYPE IF EXISTS account_source;


--
-- Common functions
--

CREATE OR REPLACE FUNCTION invalidate_cache(cache_keys text[]) RETURNS VOID AS $$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT DISTINCT unnest(cache_keys) AS name LOOP
        PERFORM pg_notify('invalidate_cache', '{ "key": "' || row.name || '" }');
    END LOOP;
END;
$$ LANGUAGE plpgsql;


--
-- Roles
--

CREATE TABLE roles (
    id bigserial NOT NULL,
    parent_id bigint NULL,
    title varchar(255) NOT NULL,
    CONSTRAINT roles_pk PRIMARY KEY(id),
    CONSTRAINT roles_unique_title UNIQUE (title),
    CONSTRAINT roles_parent_fk FOREIGN KEY(parent_id)
        REFERENCES roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION invalidate_roles_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'roles-by-id:' || NEW.id
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'roles-by-id:' || OLD.id
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON roles
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_roles_cache();


--
-- Permissions
--

CREATE TABLE permissions (
    id bigserial NOT NULL,
    role_id bigint NOT NULL,
    resource varchar(255) NULL,
    action varchar(255) NULL,
    CONSTRAINT permissions_pk PRIMARY KEY(id),
    CONSTRAINT permissions_role_fk FOREIGN KEY(role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION invalidate_permissions_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'permissions-by-id:' || NEW.id,
                'permissions-by-role-id:' || NEW.role_id
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'permissions-by-id:' || OLD.id,
                'permissions-by-role-id:' || OLD.role_id
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON permissions
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_permissions_cache();


--
-- Users
--

CREATE TABLE users (
    id bigserial NOT NULL,
    email varchar(255) NOT NULL,
    display_name varchar(255) NULL,
    password varchar(255) NULL,
    secret varchar(255) NULL,
    created_at timestamp NOT NULL,
    confirmed_at timestamp NULL,
    blocked_at timestamp NULL,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

CREATE TABLE user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    CONSTRAINT user_roles_pk PRIMARY KEY(user_id, role_id),
    CONSTRAINT user_roles_user_fk FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT user_roles_role_fk FOREIGN KEY(role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION invalidate_users_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'users-by-id:' || NEW.id,
                'users-by-email:' || NEW.email
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'users-by-id:' || OLD.id,
                'users-by-email:' || OLD.email
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON users
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_users_cache();

CREATE OR REPLACE FUNCTION invalidate_user_roles_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'roles-by-user-id:' || NEW.user_id
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'roles-by-user-id:' || OLD.user_id
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON user_roles
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_user_roles_cache();


--
-- Accounts
--

CREATE TYPE account_source AS ENUM ('google', 'facebook');

CREATE TABLE accounts (
    id bigserial NOT NULL,
    user_id bigint NOT NULL,
    source account_source NOT NULL,
    identifier varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    CONSTRAINT accounts_pk PRIMARY KEY(id),
    CONSTRAINT accounts_identifier UNIQUE(source, identifier),
    CONSTRAINT accounts_user_fk FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION invalidate_accounts_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'accounts-by-id:' || NEW.id
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'accounts-by-id:' || OLD.id
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON accounts
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_accounts_cache();


--
-- Sessions
--

CREATE TABLE sessions (
    id bigserial NOT NULL,
    token varchar(255) NOT NULL,
    user_id bigint NULL,
    payload jsonb NOT NULL,
    info jsonb NOT NULL,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    CONSTRAINT sessions_pk PRIMARY KEY (id),
    CONSTRAINT sessions_token UNIQUE(token),
    CONSTRAINT sessions_user_fk FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION invalidate_sessions_cache() RETURNS trigger AS $$
DECLARE
    cache_keys text[] := array[]::text[];
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'sessions-by-id:' || NEW.id,
                'sessions-by-token:' || NEW.token
            ]
        );
    END IF;
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        cache_keys = array_cat(
            cache_keys,
            array[
                'sessions-by-id:' || OLD.id,
                'sessions-by-token:' || OLD.token
            ]
        );
    END IF;

    PERFORM invalidate_cache(cache_keys);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache
    AFTER INSERT OR UPDATE OR DELETE
    ON sessions
    FOR EACH ROW
    EXECUTE PROCEDURE invalidate_sessions_cache();
