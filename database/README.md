The database
============

Create the database manually

```shell
# su - postgres
OR
# su - pgsql

> psql -d postgres

postgres=# create user username_here with password 'password_here';
postgres=# create database db_name_here;
postgres=# grant all privileges on database db_name_here to username_here;
postgres=# \q

> exit

# psql -U username_here -d db_name_here -h 127.0.0.1 < database/schema.1.sql
```
