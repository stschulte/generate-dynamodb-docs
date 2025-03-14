All entities shall be stored in the same DynamoDB table

### Author

An author describes a person that writes blog posts
A single author can write multiple posts

| Name | Description | Required |
|------|-------------|:--------:|
| <a name="author_name"></a> [name](#author\_name) | The name of the author | yes |
| <a name="author_nposts"></a> [nPosts](#author\_nposts) | The number of posts of the author | yes |

### Post

A single post.

A post can be seen as a news article.

| Name | Description | Required |
|------|-------------|:--------:|
| <a name="post_body"></a> [body](#post\_body) | The actual article | yes |
| <a name="post_pk"></a> [pk](#post\_pk) | Partition key. Must follow `AUTHOR#<name of author>` | yes |
| <a name="post_publishedat"></a> [publishedAt](#post\_publishedat) | The date when the article was published. This should follow [RFC3339][rfc3339] | yes |
| <a name="post_sk"></a> [sk](#post\_sk) | Sort key. Must follow `POST#<title>` | yes |
| <a name="post_tags"></a> [tags](#post\_tags) | A list of tags | no |
| <a name="post_title"></a> [title](#post\_title) | The title of the post | yes |

[rfc3339]: https://www.rfc-editor.org/rfc/rfc3339
