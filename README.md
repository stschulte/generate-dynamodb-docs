# DynamoDB Docs

[![CI Status](https://github.com/stschulte/dynamodb-docs/workflows/CI/badge.svg)](https://github.com/stschulte/dynamodb-docs/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/dynamodb-docs.svg)](https://badge.fury.io/js/dynamodb-docs)

Generate documentation about your DynamoDB table from a `dynamodb.yml` file.

## Why do you want to use dynamodb-docs

AWS DynamoDB is great to store different entities in a single table (see
also [single-table design][1].

And while DynamoDB does not have a strict schema, entities normally share the
same attributes (e.g. all "author" entities may have a "name" attribute).

This projects helps you to define those attributes in a single file and then
create both a markdown documentation about them and TypeScript definitions
to be used in your code.

## Install

Navigate to your repository that contains your GitHub action and
install `dynamodb-docs` as a development dependency:

```
npm install --save-dev dynamodb-docs
```

## Example

Let's assume you have a single table that stores authors and blog posts.
We can describe those entities in a yaml file:

```yaml
description: "Store authors and their blog posts"

defaults:
  typescriptType: AttributeValue.SMember

entities:
  Post:
    typescriptName: DynamoDBPost
    description: |-
      A single post.

      A post can be seen as a news article.
    attributes:
      title:
        description: The title of the post
      body:
        description: The actual article

  Author:
    typescriptName: DynamoDBAuthor
    description: |-
      An author describes a person that writes blog posts
      A single author can write multiple posts
    attributes:
      name:
        description: The name of the author
      nPosts:
        description: The number of posts of the author
        typescriptType: AttributeValue.NMember
```

you can now generate documentation out of this:

```
% npx dynamodb-docs --output-type markdown dynamodb.yml
### Author

An author describes a person that writes blog posts
A single author can write multiple posts

| Name | Description | Required |
|------|-------------|:--------:|
| <a name="author_name"></a> [name](#author\_name) | The name of the author | no |
| <a name="author_nposts"></a> [nPosts](#author\_nposts) | The number of posts of the author | no |

### Post

A single post.

A post can be seen as a news article.

| Name | Description | Required |
|------|-------------|:--------:|
| <a name="post_body"></a> [body](#post\_body) | The actual article | no |
| <a name="post_title"></a> [title](#post\_title) | The title of the post | no |
```

Or generate TypeScript types:

```
% npx dynamodb-docs --output-type typescript dynamodb.yml
// DynamoDB Entity Author
type DynamoDBAuthor = {
  name: AttributeValue.SMember;
  nPosts: AttributeValue.NMember;
}

// DynamoDB Entity Post
type DynamoDBPost = {
  body: AttributeValue.SMember;
  title: AttributeValue.SMember;
}
```

## Generate a README.md for DynamoDB types

You can also inject markdown to an existing file. For this add the following
markers to an existing markdown file:

```markdown
Some existing text in your README.md. It will not be overwritten.

<!-- BEGIN_DYNAMODB_DOCS -->
everything in here will be replaced
<!-- END_DYNAMODB_DOCS -->

Some existing text in your README.md. It will not be overwritten.
```

Now run `dynamodb-docs` in `inject`  mode:

```
npx dynamodb-docs --output-type markdown --mode inject --output-file README.md dynamodb.yml
```

In case you make use of prettier and/or linter, I recommend to disable it for
the automatic code block:

```markdown
Some existing text in your README.md. It will not be overwritten.

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
<!-- prettier-ignore-start -->
<!-- BEGIN_DYNAMODB_DOCS -->
everything in here will be replaced
<!-- END_DYNAMODB_DOCS -->
<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->

Some existing text in your README.md. It will not be overwritten.
```

You can do the same for TypeScript. Create a file and make sure you add the
following markers:

```typescript
import { AttributeValue } from '@aws-sdk/client-dynamodb'

/* BEGIN_DYNAMODB_DOCS */
// Everything in here will be overwritten
/* END_DYNAMODB_DOCS */
```

Now run the following command to inject the actual typescript definition:

```
npx dynamodb-docs --output-type typescript --mode inject --output-file dynamodb.ts dynamodb.yml
```


You can also create a task in your `package.json`:

```json
{
    "scripts": {
        "gen:docs:md": "dynamodb-docs --output-type markdown --output-file README.md --mode inject dynamodb.yml",
        "gen:docs:ts": "dynamodb-docs --output-type typescript --output-file src/dynamodb.ts --mode inject dynamodb.yml",
        "gen:docs": "npm run gen:docs:md && npm run gen:docs:ts"
    }
}
```

And then simply execute `npm run gen:docs` to regenerate your documentation
after updating `dynamodb.yml`

## Running test

In order to run tests locally, execute the following

```
npm ci
npm run test:coverage
```

If you get an `ERR_INSPECTOR_NOT_AVAILABLE` error, make sure your nodejs is compiled with
`inspector` support. Otherwise run `npm run test` to skip code coverage

[1]: https://aws.amazon.com/de/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/
