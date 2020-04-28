# Database Systems

- [Database Systems](#database-systems)
  - [Relational Query Language](#relational-query-language)
    - [Prerequisite](#prerequisite)
    - [Relational Algebra](#relational-algebra)
  - [SQL](#sql)
    - [Database Organization](#database-organization)
      - [Authorization](#authorization)
    - [Supported Data Types](#supported-data-types)
      - [blob and clob](#blob-and-clob)
      - [User Types](#user-types)
    - [Data Definition Language](#data-definition-language)
    - [Data Manipulation Language](#data-manipulation-language)
      - [Cartesian Product](#cartesian-product)
      - [Rename Operation](#rename-operation)
      - [Null in Expressions](#null-in-expressions)
      - [Construct Temporary Relation](#construct-temporary-relation)
      - [Update Attribute Values](#update-attribute-values)
    - [Set Operations and Nested Subquery](#set-operations-and-nested-subquery)
      - [Correlated Subqueries](#correlated-subqueries)
      - [Scalar Subqueries](#scalar-subqueries)
    - [Join](#join)
      - [Natural Join vs Conditional Join](#natural-join-vs-conditional-join)
      - [Outer Joins](#outer-joins)
      - [Self Join](#self-join)
    - [Aggregation](#aggregation)
    - [Views](#views)
    - [Index Creation](#index-creation)
    - [Transactions, Commit and Rollback](#transactions-commit-and-rollback)
    - [Constraint Checking](#constraint-checking)
  - [Additional SQL Features](#additional-sql-features)
    - [Functions, Procedures, Recursion](#functions-procedures-recursion)
    - [Triggers](#triggers)
    - [Programming Language Integration](#programming-language-integration)
    - [OLAP](#olap)

## Relational Query Language

### Prerequisite

Relation components:

- **Relation** is table.
- **Tuple** is a row of the table.
- **Attribute** is a column.

Relation keys:

- **Superkey** is a set of attributes that can identify a unique tuple. **Candidate key** is a minimal superkey with no extraneous attributes.
- **Primary key** is a candidate key that is the designated means of tuple identification.
- **Foreign key** references the primary key of another relation.
  - **Referencing relation** has the foreign key.
  - **Referenced relation**'s primary key is referenced.

Relation rules:

- **Domain atomicity** states the domain of any attribute must be indivisible (fixed size, statically allocated), with _null_ value being an exception.
- **Foreign key constraint** states that the referencing relation's foreign key must be the primary key of the referenced relation. All referenced values must exist in the referenced relation without duplicate.
- **Referential integrity constraint** states that all referenced value must exist in the referenced relation (duplicate allowed).

Database schemas:

- **Relation schemas** outlines all attributes of a relation, including primary keys (underlined), and foreign keys(pointed by arrows)
- **Database schemas** shows the relation schemas and the interaction between them.

### Relational Algebra

- **Selection**, $\sigma_\textrm{predicate}(\textrm{table})$: return rows of the input relation that satisfy the predicate.
- **Projection**, $\Pi_\textrm{attributes}(\textrm{table})$: return specified attributes from all rows of the input relation. Remove duplicate tuples from the output.
- **Natural Join**, $\textrm{table1} \bowtie \textrm{table2}$: returns pairs of rows from two input relations that have the same value on all attributes that have the same name.
- **Cartesian Product**, $\textrm{table1} \times\textrm{table2}$: returns all pairs of rows from the two input relations
- **Union**, $\Pi_\textrm{attributes}(\textrm{table1}) \cup\Pi_\textrm{attributes}(\textrm{table2})$: returns the union of tuples from the two input relations.

## SQL

### Database Organization

Like a file system, modern database systems provide a three-level hierachy for naming relations.
The top level of the hierachy consists of **catalogs**, each of which contains **schemas**.
Schemas contain **SQL objects** (e.g. relations, views).

One can identify a relation using the full path, for example, `catalog5.univ_schema.course`.

Each user has a **SQL environment** that is set up for each connection.
The SQL environment contains info like default catalog and schema.

One can also `create schema` or `drop schema`, do try it at home.

#### Authorization

DB administrator can grant/revoke `select`, `insert`, `update`, and `delete` privileges to DB user, and can grant users to pass on these privileges to other users.
Basically,

```sql
grant <privilege list>
on <relation name or view name>
to <user/role list>
with grant option;          --option: to allow passing on permission

revoke <privilege list>
on <relation name or view name>
from <user/role list>;

revote grant option
for <privilege list>
on <relation name or view name>
from <user/role list>;      --option: can no longer pass on permission
```

The special user name **public** refers to all current and future user of the system, so do be careful.

Granting individual users authorization can be repetitive, therefore DB administrator can create roles.
Users granted the role `role_name` must run `set role role_name` to assume the role.

```sql
create role instructor;
```

DB admin can also grant foreign-key permission on specific schema attribute. See doc for more.

### Supported Data Types

SQL supports char(n), varchar(n), int, smallint, numeric(p, d), double, float, and datetime.

#### blob and clob

Database applications may need large attribute to store **l**arge **ob**jects (*lob).
SQL has large-object data types for character data (**clob**) or binary data (**blob**).

```sql
dialog  clob(5KB)
image   blob(5MB)
game    blob(50GB)
```

It is inefficient to retrieve the entire large object in memory.
Applications usually use SQL query to retrieve a locator for the large object and then "paginate" the actual large object.

#### User Types

User types are based on an actual type, but are strongly typed.

```sql
create type Dollars as numeric(12,2) final;
create type Pounds as numeric(12,2) final;

create table department
    (dept_name  varchar(20),
    budget      Dollars);
```

One can `cast (department.budget to numeric(12,2))` to convert the `Dollar` type back to `numeric` type.

Before user-defined types, there were **domain** which operates the same except 1) domains can have constraints 2) domains are not strongly typed. Look up docs on domain if interested.

### Data Definition Language

Create table:

```sql
create table course
    (course_id  varchar(7),
    title       varchar(50),
    dept_name   varchar(20),
    credit      numeric(2,0) default 0,       --if not specified in insert
    primary key (course_id, title),                 --integrity-constraint
    foreign key (dept_name) references department); --integrity-constraint

create table tmp like instructor;   --creates an empty table with schema

create table t1 as
    (select * from instructor)
    with data;                      --populate the otherwise empty table
```

Insert rows:

```sql
insert into course
    value ('id', 'title', 'eng', 1);
insert into course (title, course_id, credits, dept_name) --whatever-order
    values ('Database Systems', 'CS-437', 4, 'Comp. Sci.');

insert into instructor
    select ID, name, dept_name, 18000
    from student
    where tot_cred > 144;
```

In the last case, the `select` clause is evaluated completely before any insertion occurs.

Delete rows:

```sql
delete from r; --delete all rows
delete from r
    where P;
```

Delete table:

```sql
drop table r;
```

Alter attribute:

```sql
alter table r add A D;  --A=attr_name, D=type
alter table r drop A;   --remote attribute A
```

4.5.6 Create table extensions

### Data Manipulation Language

Simple query:

```sql
select A from r;            --duplicate
select all A from r;        --explicit-duplicate
select distinct A from r;   --no-duplicate
```

Query with condition and order:

```sql
select dept_name, salary*1.1
    from instructor
    where dept_name like '%eng%' and salary between 90 and 100 and ID<>0
    order by depart_name desc, salary asc;
```

`like` is used for pattern string pattern matching:

- `%` matches substring
- `_` matches any character

`order by` list items in ascending order by default.

#### Cartesian Product

```sql
select A1, A2, An
    from E1, E2, Em; --cartisian-product

select name, title
    from instructor natural join teaches, course
    where teaches.course_id=course.course_id;
```

where `E1, E2, Em` can be a single relation or an expression of natural joins.

It is worth noting that as a special case, the following two expressions are equivalent:

```sql
select name, course_id
    from instructor, teaches
    where instructor.ID=teaches.ID;

select name, course_id
    from instructor natural join teaches;
```

#### Rename Operation

Renaming attributes:

```sql
select A as attr
    from r;
```

Renaming relations:

```sql
select T.name, S.course_id
    from instructor as T, teaches as S
    where T.ID=S.ID;
```

The `T, S` alias is called **correlation name**, **table alias**, **correlation variable**, or a **tuple variable**.

#### Null in Expressions

- `1 < null` evaluates to 'unknown'
- `and`/`or` involving null/'unknown' evaluates 'unknown', with 2 exceptions:
  - false `and` 'unknown' evaluates to false
  - true `or` 'unknown' evaluates to true
- `not` 'unknown' evaluates to unknown
- `is null` evaluates to boolean

'unknown' is a third logical value created to deal with null value.
It eventually evaluates to false.

#### Construct Temporary Relation

```sql
with dept_total (dept_name, value) as   --first-temp-table
    (select dept_name, sum(salary)
    from instructor
    group by dept_name),
dept_total_avg(value) as                --second-temp-table
    (select avg(value)
    from dept_total)
select dept_name
    from dept_total, dept_total_avg
    where dept_total.value >= dept_total_avg.value;
```

#### Update Attribute Values

```sql
update instructor
    set salary=salary*1.1;

update instructor
    set salary = case
                    when salary <= 100000 then salary * 1.05
                    else salary * 1.03
                 end
```

### Set Operations and Nested Subquery

Basic set operation:

```sql
r1 union r2;            --no-duplicate
r1 union all r2;        --duplicate
r1 intersect r2;        --no-duplicate
r1 intersect all r2;    --duplicate
r1 except r2;           --no-duplicate
r1 except all r2;       --duplicate
```

Test membership:

```sql
select distinct A
    from r1
    where A not in r2; --r2 can be a nested subquery
```

Set comparison:

```sql
select name
    from instructor
    where salary > some(select salary
                        from instructor
                        where dept_name = 'bio')
select name
    from instructor
    where salary > all(r2)
```

#### Correlated Subqueries

Test empty:

```sql
select course_id
    from section as S
    where semester='Fall' and
        exists (select *
                from section as T
                where semester='Spring' and
                    S.course_id=T.course_id);   --correlated subquery
```

Note that a subquery that uses a correlation name from an outer query is **correlated subquery**.
Subqueries in the `from` clause do not support correlated subquery!

Test containment: we could use `not exists (B except A)` to test that "relation A contains relation B"

Test duplicate using `unique`:

```sql
select T.course_id
    from course as T
    where unique (select course_id from section as R
                  where T.course_id= R.course_id and
                        R.year = 2009);
```

Note that `unique` evaluates to true on an empty set.

#### Scalar Subqueries

SQL allows **scalar subqueries** (1 tuple, 1 attribute) to occur wherever a single value is permitted. Scalar subqueries can occur in `select`, `where`, or `having` clauses.

```sql
select dept_name,
        (select count(*)    --scalar-subquery
         from instructor
         where department.dept_name = instructor.dept_name)
        as num_instructors
    from department;
```

### Join

#### Natural Join vs Conditional Join

**Natural join** (`join ... using <attributes>`) joins together two relations. It considers only those pairs of tuples with the same value on those attributes that appear in the schemas of both relations. It then merge the pair and append to the return relation.

```sql
select * from student natural join takes;           --using-all-shared-attr
select * from student join takes using (ID);
select * from student inner join takes using (ID);  --equivalent
```

**Conditional Join** (`join ... on <conditions>`) simply concatenates the attributes of the two relation as long as the join conditions are met.
This means that certain attributes will appear twice.

```sql
select *
    from student join takes on student.ID=takes.ID;

--in this case,the following query is equivalent
select * from student, takes where student.ID=takes.ID;
```

#### Outer Joins

3 types of outer join:

- `left outer join` preserves unmatched tuples in left-hand-side relation.
- `right outer join` preserves unmatched tuples in right-hand-side relation.
- `full outer join` preserves tuple in both relations.

Left outer join are computed using these steps:

1. perform inner join
2. for all tuples on the left-hand-side relation that's unmatched (primary-key value not in result table): fill in known attribute values, and fill the rest with null

```sql
select *
from takes natural right outer join student;
```

#### Self Join

A self join a technique where the table is joined with itself.

```sql
select column_name(s) from table1 T1, table1 T2 where condition;

--example: pairing instructors in the same department
select I1.name, I2.name, I1.department
from instructor I1, instructor I2 where I1.ID <> I2.ID
and I1.dept_name = I2.dept_name;
```

### Aggregation

Basic aggregate functions include `avg`, `min`, `max`, `sum`, `count`.
Aggregate functions `some`, `every` deals with boolean data type.

```sql
select count(*) from r; --counts-all-entries

select A1, avg(A2) from r
    group by A1;

select A1, A2, max(A3) from r
    group by A1, A2         --cartesian-product-grouping
    having max(A3) > 50;
```

Only attributes present in `group by` clause may appear in `select` statement without aggregate function.

### Views

**Views** are "virtual relations" that can be placed wherever a relation may appear.
The virtual relation executes its query whenever it is used.

```sql
create view v as <query expression>;

create view faculty as
    select ID, name, dept_name from instructor;
```

**Materialized views** stores the view relations (as duplicate), but make sure if the view definition change, the view is kept up-to-date.
The way DB manages to keep materialized views up-to-date depends on implementation;
there are bad implementation mind you.

One can also update a view by `insert into` a view, look up documentation specific for your DB if you really wan to learn that.

### Index Creation

An **index** on an attribute of a relation is a data structure that allows database system to find the values of that attribute efficiently.
A widely used kind of index is called B+ Tree index.

```sql
create index studentID_index on student(ID); --non-standard
```

### Transactions, Commit and Rollback

A **transaction** consists of a sequence of query/update.

- **Commit work** commits the current transaction. It makes the updates performed by the transaction permanent. After commiting a new transaction is automatically started.
- **Rollback work** causes the current transaction to roll back. It undoes all the updates performed by the SQL statements in the transaction. An error during one SQL statement roll back the transaction completely.

Generally, each SQL statement commits a separate transaction.
Look up documentation for your specific DB on how to run multiple SQL commands as one transaction.

### Constraint Checking

Constraint checking during table creation:

- **not null** constraint: `name varchar(20) not null`
- **unique** constraint: `unique (A1, A2, ..., An)`, primary key are unique by default
- foreign key constraint, already shown

Check clause:

```sql
create table section
    (course_id  varchar(8) check (course_id > 0),       --syntax-1
     sec_id     varchar(8),
     semester   varchar(6),
     foreign key(course_id) references course
                 on delete cascade
                 on update cascade,
     check(semester in ('Fall', 'Winter', 'Summer')));  --syntax-2
```

Due to foreign key constraint, deleting/update a row in the referenced table may cause referential integrity violation.
Therefore, `on delete cascade` and `on update cascade` in the referencing table's foreign key field enables SQL to correct such violation.
Note the word 'cascade', if there is a chain of foreign-key dependencing across multiple relations, the deletion or update will propagate.
If a cascading update/delete causes a constraint violation that cannot be handled, the transaction will roll back.

One can also define more complex condition checks using **assertion**:

```sql
create assertion <assertion-name> check (<predicate>)
```

Look up your own docs for more info.

## Additional SQL Features

This section outlines other less commonly seen SQL features.

### Functions, Procedures, Recursion

SQL can even support recursion.
Search it up if you will.
I won't bother going into it since it's just recursion in programming language with much more disgusting syntax.
Look up doc for more info.

### Triggers

### Programming Language Integration

### OLAP