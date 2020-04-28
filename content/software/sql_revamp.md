# Database Systems

- [Database Systems](#database-systems)
  - [Relational Query Language](#relational-query-language)
    - [Prerequisite](#prerequisite)
    - [Relational Algebra](#relational-algebra)
  - [SQL](#sql)
    - [Supported Data Types](#supported-data-types)
      - [blob and clob](#blob-and-clob)
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
    - [Functions, Procedures, Recursion](#functions-procedures-recursion)
  - [Additional SQL Features](#additional-sql-features)
    - [Authorization](#authorization)
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

### Supported Data Types

SQL supports char(n), varchar(n), int, smallint, numeric(p, d), double, float, and datetime.

#### blob and clob

### Data Definition Language

Create table with constraints:

```sql
create table course
    (course_id  varchar(7),
    title       varchar(50),
    dept_name   varchar(20),
    credit      numeric(2,0),
    primary key (course_id, title),                 --integrity-constraint
    foreign key (dept_name) references department); --integrity-constraint
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
select * from student join takes using (ID);
select * from student inner join takes using (ID); --equivalent
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



#### Self Join

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

### Index Creation

### Transactions, Commit and Rollback

### Constraint Checking

- unique constraint
- not null constraint
- check clause
- assertion

### Functions, Procedures, Recursion

SQL can even support recursion.
Search it up if you will.
I won't bother going into it since it's just recursion in programming language with much more disgusting syntax.

## Additional SQL Features

This section outlines other less commonly seen SQL features.

### Authorization

### Triggers

### Programming Language Integration

### OLAP