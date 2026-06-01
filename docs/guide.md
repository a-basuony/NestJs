# NestJS CRUD Project Technical Guide

This guide explains the current project as a learning document. It is based on the actual files in this codebase, not on a generic NestJS example.

## 1. Project Overview

This project is a NestJS backend API for a small CRUD application. It currently has three main resources:

- Users: registration, login, current user, admin list, update, and delete.
- Products: create, read, update, delete, plus simple filtering by title and price range.
- Reviews: create, read, update, delete, and list reviews for a product.

The backend uses:

- NestJS as the application framework.
- TypeORM as the ORM.
- PostgreSQL as the database.
- DTOs and `class-validator` for request validation.
- JWT authentication for protected routes.
- Role-based authorization for admin/user permissions.

CRUD means:

- Create: add a new record.
- Read: fetch one or many records.
- Update: change an existing record.
- Delete: remove an existing record.

In this project, each resource follows the same basic NestJS pattern:

1. A module groups the feature.
2. An entity defines the database table.
3. DTOs define and validate request bodies.
4. A controller receives HTTP requests.
5. A service contains business logic and database calls.
6. Guards protect endpoints that require login or roles.

## 2. NestJS Architecture Used In This Project

### `main.ts`

`src/main.ts` is the application entry point. It creates the Nest app from `AppModule`, configures global validation, then starts the server.

Important code:

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
await app.listen(process.env.PORT ?? 3000);
```

Why it exists:

- Starts the backend.
- Applies global `ValidationPipe`.
- Enables DTO validation across controllers.
- Converts route/query parameters when possible because `transform: true` is enabled.

### `app.module.ts`

`src/app.module.ts` is the root module. It imports feature modules and configures global providers.

It imports:

- `ProductsModule`
- `UsersModule`
- `ReviewsModule`
- `ConfigModule`
- `TypeOrmModule`

It configures PostgreSQL with environment variables:

```ts
type: 'postgres',
host: configService.get<string>('DB_HOST'),
port: configService.get<number>('DB_PORT'),
username: configService.get<string>('DB_USERNAME'),
password: configService.get<string>('DB_PASSWORD'),
database: configService.get<string>('DB_DATABASE'),
entities: [Product, User, Review],
```

It also registers `ClassSerializerInterceptor` globally through `APP_INTERCEPTOR`. This matters because the `User` entity uses `@Exclude()` on `password`, so password is hidden from serialized responses.

### Feature Modules

Feature modules group code by domain:

- `UsersModule` owns users and authentication provider setup.
- `ProductsModule` owns product logic.
- `ReviewsModule` owns review logic.

Each feature module tells Nest which controller, service, entity repository, and imported modules belong to that feature.

### Controllers

Controllers define HTTP routes. They read route params, query params, request bodies, and the authenticated user payload.

Examples:

- `UsersController` handles `/api/users`.
- `ProductsController` handles `/api/products`.
- `ReviewsController` handles `/api/reviews`.

Controllers should stay thin. They call service methods and return the service result.

### Services

Services contain business logic. They call TypeORM repositories and other services.

Examples:

- `UsersService` registers, logs in, fetches, updates, and deletes users.
- `ProductsService` creates products and validates that the owner user exists.
- `ReviewsService` links a review to both a product and a user.

### DTOs

DTO means Data Transfer Object. DTO classes define what a request body is allowed to contain.

Examples:

- `RegisterDto` validates registration data.
- `CreateProductDto` validates product creation data.
- `CreateReviewDto` validates review creation data.

DTO validation works because `main.ts` registers `ValidationPipe` globally.

### Entities

Entities are TypeORM classes that become database tables.

- `User` maps to the `users` table.
- `Product` maps to the `products` table.
- `Review` maps to the `reviews` table.

Entities define columns, primary keys, timestamps, and relationships.

### Providers And Dependency Injection

Providers are classes Nest can create and inject. Services, guards, and custom providers are examples.

Example:

```ts
constructor(
  @InjectRepository(User) private userRepository: Repository<User>,
  private readonly authProvider: AuthProvider,
) {}
```

Nest injects the TypeORM repository and `AuthProvider` into `UsersService`.

### Decorators

Decorators attach metadata to classes and methods.

Common decorators in this project:

- `@Module()` defines a module.
- `@Controller()` defines a route group.
- `@Get()`, `@Post()`, `@Patch()`, `@Put()`, `@Delete()` define endpoints.
- `@Body()`, `@Param()`, `@Query()` read request data.
- `@Entity()`, `@Column()`, `@ManyToOne()` define database mapping.
- `@UseGuards()` applies guards.
- `@Roles()` stores role metadata.
- `@CurrentUser()` reads the JWT payload from the request.

### Pipes And Validation

The project uses:

- Global `ValidationPipe` in `main.ts`.
- `ParseIntPipe` in route params and query values.

`ValidationPipe` checks DTO rules. `ParseIntPipe` converts route params like `"1"` into `1` and rejects invalid numbers.

### Guards

The project has two guards:

- `JWTAuthGuard`: checks the `Authorization: Bearer <token>` header, verifies JWT, and attaches payload to the request.
- `RolesGuard`: checks if the user role matches the roles defined by `@Roles()`.

### Interceptors

The project contains `LoggingInterceptor`, but it is not currently active globally. `ClassSerializerInterceptor` is active globally in `AppModule`, which helps hide excluded fields like `password`.

### Filters

There are no custom exception filters in the current codebase. NestJS default exception handling is used.

### Config Files

- `.env.development` stores environment values for development.
- `ConfigModule.forRoot()` loads `.env.${NODE_ENV || 'development'}`.
- `package.json` defines scripts such as `start:dev`, `build`, `test`, and `lint`.

## 3. Folder Structure Explanation

### `src/main.ts`

- Purpose: start the Nest app.
- Main responsibilities: create app, enable validation, listen on port.
- Connected to: `AppModule`.
- Important logic: global `ValidationPipe`.
- Notes for learning: this is the first file that runs.

### `src/app.module.ts`

- Purpose: root module.
- Main responsibilities: import feature modules, configure database, register global serializer interceptor.
- Connected to: users, products, reviews, config, TypeORM.
- Important logic: PostgreSQL connection and entity registration.
- Notes for learning: every feature must eventually connect to the root module directly or indirectly.

### `src/users/users.module.ts`

- Purpose: package user-related code.
- Main responsibilities: register `User` repository, JWT module, controller, service, and auth provider.
- Connected to: `UsersController`, `UsersService`, `AuthProvider`, `User`.
- Important methods: module metadata only.
- Notes for learning: exports `UsersService` so other modules can use it.

### `src/users/users.controller.ts`

- Purpose: define user HTTP endpoints.
- Main responsibilities: registration, login, current user, list users, update user, delete user.
- Connected to: `UsersService`, `JWTAuthGuard`, `RolesGuard`, DTOs.
- Important methods: `register`, `login`, `getCurrentUser`, `getAllUsers`, `updateUser`, `deleteUser`.
- Notes for learning: controller reads HTTP data and delegates to service.

### `src/users/users.service.ts`

- Purpose: user business logic.
- Main responsibilities: call auth provider, fetch users, update user, delete user.
- Connected to: `User` repository, `AuthProvider`.
- Important methods: `register`, `login`, `getCurrentUser`, `getAllUsers`, `updateUser`, `deleteUser`.
- Notes for learning: this is where user database logic lives.

### `src/users/auth.provider.ts`

- Purpose: authentication helper provider.
- Main responsibilities: register users, login users, hash passwords, generate JWTs.
- Connected to: `User` repository, `JwtService`, bcrypt.
- Important methods: `register`, `login`, `hashPassword`, `generateJWT`.
- Notes for learning: this separates auth logic from general user CRUD logic.

### `src/users/user.entity.ts`

- Purpose: TypeORM user table definition.
- Main responsibilities: define columns and relationships.
- Connected to: `Product`, `Review`.
- Important fields: `id`, `username`, `email`, `password`, `userType`, `isAccountVerified`, `products`, `reviews`, timestamps.
- Notes for learning: `@Exclude()` hides password from responses when serialization runs.

### `src/users/dtos/register.dto.ts`

- Purpose: validate registration body.
- Main responsibilities: require valid email and password, allow optional username.
- Connected to: `UsersController.register`.
- Notes for learning: DTOs protect your service from invalid input.

### `src/users/dtos/login.dto.ts`

- Purpose: validate login body.
- Main responsibilities: require valid email and password.
- Connected to: `UsersController.login`.

### `src/users/dtos/update-user.dto.ts`

- Purpose: validate update user body.
- Main responsibilities: allow optional password and username.
- Connected to: `UsersController.updateUser`.
- Note: `username` has `@IsOptional()` twice. It works, but one can be removed.

### `src/users/guards/jwt-auth.guard.ts`

- Purpose: protect routes that require login.
- Main responsibilities: verify JWT and attach payload to `request['user']`.
- Connected to: controllers using `@UseGuards(JWTAuthGuard)`.

### `src/users/guards/roles.guard.ts`

- Purpose: protect routes by role.
- Main responsibilities: read roles metadata and compare it to `request['user'].userType`.
- Connected to: `@Roles()` decorator and controllers using `@UseGuards(JWTAuthGuard, RolesGuard)`.

### `src/users/decorators/roles.decorator.ts`

- Purpose: custom decorator for allowed roles.
- Main responsibilities: store role metadata using `SetMetadata`.
- Connected to: `RolesGuard`.

### `src/users/decorators/current-user.decorator.ts`

- Purpose: read the JWT payload from the request.
- Main responsibilities: return `request['user']`.
- Connected to: `JWTAuthGuard` and controller methods using `@CurrentUser()`.

### `src/users/interceptors/logging.interceptor.ts`

- Purpose: sample interceptor for logging request handling time.
- Main responsibilities: log before and after route handler.
- Connected to: not currently active in `AppModule`; it is commented out.

### `src/products/products.module.ts`

- Purpose: package product-related code.
- Main responsibilities: register product repository, import `UsersModule`, configure JWT, expose `ProductsService`.
- Connected to: `ProductsController`, `ProductsService`, `Product`, `UsersModule`.
- Notes for learning: imports `UsersModule` because product creation needs the current user.

### `src/products/products.controller.ts`

- Purpose: define product HTTP endpoints.
- Main responsibilities: create, list/filter, get one, update, delete products.
- Connected to: `ProductsService`, DTOs, guards, roles.
- Important methods: `CreateProduct`, `GetAllProducts`, `GetProductById`, `updateProduct`, `deleteProduct`.

### `src/products/products.service.ts`

- Purpose: product business logic.
- Main responsibilities: create product, filter products, find one, update, delete.
- Connected to: `Product` repository, `UsersService`.
- Important methods: `create`, `findAll`, `findOne`, `update`, `delete`.

### `src/products/product.entity.ts`

- Purpose: TypeORM product table definition.
- Main responsibilities: define product columns and relationships.
- Connected to: `User`, `Review`.
- Important fields: `id`, `title`, `description`, `price`, `reviews`, `user`, timestamps.
- Notes for learning: product has many reviews and belongs to one user.

### `src/products/dtos/create-product.dto.ts`

- Purpose: validate product creation body.
- Main responsibilities: require title and price, validate description if sent.
- Connected to: `ProductsController.CreateProduct`.

### `src/products/dtos/update-product.dto.ts`

- Purpose: validate product update body.
- Main responsibilities: allow optional title, description, and price.
- Connected to: `ProductsController.updateProduct`.

### `src/reviews/reviews.module.ts`

- Purpose: package review-related code.
- Main responsibilities: register review repository, import users/products modules.
- Connected to: `ReviewsController`, `ReviewsService`, `Review`, `UsersModule`, `ProductsModule`.
- Notes for learning: reviews need both users and products.

### `src/reviews/reviews.controller.ts`

- Purpose: define review HTTP endpoints.
- Main responsibilities: create review, list all reviews, list product reviews, get one, update, delete.
- Connected to: `ReviewsService`, DTOs, guards, roles.
- Important methods: `createReview`, `getAllReviews`, `getReviewsByProductId`, `getReviewById`, `updateReview`, `deleteReview`.

### `src/reviews/reviews.service.ts`

- Purpose: review business logic.
- Main responsibilities: link reviews to product/user, enforce ownership, handle admin deletion, format responses.
- Connected to: `Review` repository, `ProductsService`, `UsersService`.
- Important methods: `create`, `findOne`, `update`, `delete`, `getByProductId`, `findAll`.

### `src/reviews/review.entity.ts`

- Purpose: TypeORM review table definition.
- Main responsibilities: define rating/comment and relations.
- Connected to: `User`, `Product`.
- Important fields: `id`, `rating`, `comment`, `product`, `user`, timestamps.
- Notes for learning: deleting a user or product cascades to related reviews.

### `src/reviews/dtos/create-review.dto.ts`

- Purpose: validate review creation body.
- Main responsibilities: rating must be 1 to 5; comment must be 2 to 1000 chars.
- Connected to: `ReviewsController.createReview`.

### `src/reviews/dtos/update-review.dto.ts`

- Purpose: validate review update body.
- Main responsibilities: optional rating and optional comment with validation rules.
- Connected to: `ReviewsController.updateReview`.

### `src/utils/types.ts`

- Purpose: shared TypeScript types.
- Main responsibilities: define JWT payload, access token response, review response shape.
- Connected to: users/reviews services and guards.

### `src/utils/enums.ts`

- Purpose: shared enums.
- Main responsibilities: define `UserType.ADMIN` and `UserType.USER`.

### `src/utils/constants.ts`

- Purpose: shared constants.
- Main responsibilities: define timestamp SQL expression and current user request key.

## 4. Request Lifecycle / Full Flow

The general request flow is:

1. Client sends HTTP request.
2. Nest app receives it through `main.ts`.
3. Global `ValidationPipe` validates DTO bodies and transforms values.
4. If the route has guards, guards run before the controller method.
5. Controller method receives body, params, query, and current user payload.
6. Controller calls service.
7. Service applies business logic.
8. Service uses TypeORM repository or another service.
9. Database operation runs.
10. Service returns data.
11. Controller returns response.
12. `ClassSerializerInterceptor` serializes response and hides excluded fields.

### Create User

Endpoint: `POST /api/users/auth/register`

1. Body reaches `UsersController.register`.
2. `RegisterDto` validates email, password, and optional username.
3. Controller calls `UsersService.register`.
4. Service calls `AuthProvider.register`.
5. Auth provider checks if email already exists.
6. Password is hashed with bcrypt.
7. User entity is created and saved.
8. JWT payload is created with user id and role.
9. Access token is returned.

### Get All Users

Endpoint: `GET /api/users/all`

1. `JWTAuthGuard` verifies token.
2. `RolesGuard` requires admin role.
3. Controller calls `UsersService.getAllUsers`.
4. Service calls `userRepository.find()`.
5. Users are returned with password excluded by serializer.

### Get User By ID

There is no public `GET /api/users/:id` endpoint in the current code. The available user read endpoint is `GET /api/users/current-user`, which fetches the authenticated user by the id inside the JWT payload.

### Update User

Endpoint: `PATCH /api/users/update`

1. JWT and roles guards run.
2. `UpdateUserDto` validates optional fields.
3. `@CurrentUser()` extracts payload.
4. Controller calls `UsersService.updateUser(payload.id, body)`.
5. Service finds the current user.
6. If username exists, it updates username.
7. If password exists, it hashes the new password.
8. Service saves the user and returns it.

### Delete User

Endpoint: `DELETE /api/users/:id`

1. JWT and roles guards run.
2. Controller reads `id` param and current user payload.
3. Service finds target user.
4. Service checks if requester is admin or deleting self.
5. If not allowed, it throws `ForbiddenException`.
6. Service deletes user by id.
7. Success message is returned.

### Create Product

Endpoint: `POST /api/products`

1. JWT and roles guards run.
2. `@Roles(UserType.ADMIN)` requires admin.
3. `CreateProductDto` validates body.
4. Controller calls `ProductsService.create(body, payload.id)`.
5. Service gets the current user through `UsersService`.
6. Title is normalized to lowercase.
7. Product entity is created with the user relation.
8. Product is saved and returned.

### Get All Products

Endpoint: `GET /api/products`

1. Controller reads optional `title`, `minPrice`, and `maxPrice` query params.
2. Controller calls `ProductsService.findAll`.
3. Service builds TypeORM filters.
4. `Like()` filters title.
5. `Between()` filters price when both min and max exist.
6. Repository returns matching products.

### Get Product By ID

Endpoint: `GET /api/products/:id`

1. `ParseIntPipe` converts id to number.
2. Controller calls `ProductsService.findOne`.
3. Service uses `productRepository.findOne`.
4. If missing, throws `NotFoundException`.
5. Product is returned.

### Update Product

Endpoint: `PUT /api/products/:id`

1. JWT and roles guards require admin.
2. `ParseIntPipe` converts id.
3. `UpdateProductDto` validates body through route-level `ValidationPipe`.
4. Service loads product with `findOne`.
5. `Object.assign(product, updateProductDto)` applies changes.
6. Product is saved.

### Delete Product

Endpoint: `DELETE /api/products/:id`

1. JWT and roles guards require admin.
2. Service finds product.
3. Service removes product with `productRepository.remove`.
4. Related reviews are deleted by cascade from the review relation.
5. Success message is returned.

### Create Review

Endpoint: `POST /api/reviews/:productId`

1. JWT and roles guards allow admin or user.
2. `CreateReviewDto` validates rating/comment.
3. `ParseIntPipe` converts product id.
4. `@CurrentUser()` reads user id from token.
5. Service finds product through `ProductsService.findOne`.
6. Service finds user through `UsersService.getCurrentUser`.
7. Review is created with product and user relations.
8. Review is saved.
9. Service returns a simplified review response.

### Get All Reviews

Endpoint: `GET /api/reviews?page=1&limit=10`

1. JWT and roles guards require admin.
2. Query params are parsed as numbers.
3. Service calculates `skip = (page - 1) * limit`.
4. Repository finds reviews with product and user relations.
5. Reviews are ordered newest first and mapped to response shape.

### Get Review By ID

Endpoint: `GET /api/reviews/:id`

1. `ParseIntPipe` converts id.
2. Service loads review with product and user relations.
3. Missing review throws `NotFoundException`.
4. Review is formatted and returned.

### Update Review

Endpoint: `PATCH /api/reviews/:id`

1. JWT and roles guards allow admin or user.
2. DTO validates optional fields.
3. Service loads review.
4. Service checks `review.user.id !== payload.id`.
5. If requester is not owner, throws `ForbiddenException`.
6. Rating/comment are updated if provided.
7. Review is saved and formatted.

Note: admins are allowed through the route guard, but the service update logic currently only allows the owner to update.

### Delete Review

Endpoint: `DELETE /api/reviews/:id`

1. JWT and roles guards allow admin or user.
2. Service loads review.
3. Service checks owner or admin.
4. If not allowed, throws `ForbiddenException`.
5. Review is removed.
6. Success message is returned.

## 5. Users Module Documentation

### Responsibility

The users module handles accounts, authentication, JWT token generation, user updates, admin user listing, and user deletion.

### Files

- `users.module.ts`: registers user dependencies.
- `users.controller.ts`: exposes user endpoints.
- `users.service.ts`: handles user business logic.
- `auth.provider.ts`: handles register/login/password/JWT logic.
- `user.entity.ts`: defines users table.
- `dtos/register.dto.ts`: registration validation.
- `dtos/login.dto.ts`: login validation.
- `dtos/update-user.dto.ts`: update validation.
- `guards/jwt-auth.guard.ts`: token validation.
- `guards/roles.guard.ts`: role validation.
- `decorators/current-user.decorator.ts`: reads authenticated payload.
- `decorators/roles.decorator.ts`: marks required roles.

### Entity / Schema

`User` table fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | number | Primary generated id |
| `username` | varchar(150) | Nullable |
| `email` | varchar(250) | Unique, nullable in current DB config |
| `password` | varchar(255) | Excluded from serialized responses |
| `userType` | enum | `admin` or `user`, default `user` |
| `isAccountVerified` | boolean | Default `false` |
| `products` | relation | One user can own many products |
| `reviews` | relation | One user can write many reviews |
| `createdAt` | timestamp | Auto-created |
| `updatedAt` | timestamp | Auto-updated |

### DTOs

`RegisterDto`:

- `email`: string, not empty, email, max 250.
- `password`: string, not empty, min 5.
- `username`: optional string, length 2 to 150.

`LoginDto`:

- `email`: string, not empty, email, max 250.
- `password`: string, not empty, min 5.

`UpdateUserDto`:

- `password`: optional string, not empty if sent, min 5.
- `username`: optional string, length 2 to 150.

### Controller Endpoints

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/users/auth/register` | `register` | `RegisterDto` | `register` | Create user and token |
| POST | `/api/users/auth/login` | `login` | `LoginDto` | `login` | Login and token |
| GET | `/api/users/current-user` | `getCurrentUser` | JWT payload | `getCurrentUser` | Current user profile |
| GET | `/api/users/all` | `getAllUsers` | admin JWT | `getAllUsers` | Admin user list |
| PATCH | `/api/users/update` | `updateUser` | `UpdateUserDto`, JWT payload | `updateUser` | Update own account |
| DELETE | `/api/users/:id` | `deleteUser` | id, JWT payload | `deleteUser` | Delete self or admin delete |

### Service Methods

`register()`:

- Used by: register endpoint.
- Input: `RegisterDto`.
- Logic: delegates to `AuthProvider.register`.
- Database operation: find existing email, create user, save user.
- Output: `{ accessToken }`.

`login()`:

- Used by: login endpoint.
- Input: `LoginDto`.
- Logic: delegates to `AuthProvider.login`.
- Database operation: find user by email.
- Output: `{ accessToken }`.

`getCurrentUser()`:

- Used by: current user endpoint and other services.
- Input: user id.
- Logic: find user by id.
- Database operation: `findOne`.
- Output: user entity.

`getAllUsers()`:

- Used by: admin endpoint.
- Input: none.
- Logic: return all users.
- Database operation: `find`.
- Output: user array.

`updateUser()`:

- Used by: update endpoint.
- Input: user id and `UpdateUserDto`.
- Logic: update username and hash password if provided.
- Database operation: `findOne`, `save`.
- Output: updated user.

`deleteUser()`:

- Used by: delete endpoint.
- Input: target user id and JWT payload.
- Logic: allow admin or same user.
- Database operation: `findOne`, `delete`.
- Output: success message.

### CRUD Flow

- Create: register endpoint creates a user.
- Read: current-user and all users endpoints read users.
- Update: update endpoint changes current user.
- Delete: delete endpoint removes a user.

### Example Requests

Register:

```http
POST /api/users/auth/register
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "12345",
  "username": "ahmed"
}
```

Response:

```json
{
  "accessToken": "jwt-token-here"
}
```

Login:

```http
POST /api/users/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "12345"
}
```

### Common Mistakes

- Forgetting `Authorization: Bearer <token>` on protected routes.
- Trying to access `/api/users/all` as a normal user.
- Sending extra fields while `forbidNonWhitelisted` is true.
- Forgetting password is hidden because of `@Exclude()`.

### Interview Explanation

The users module manages user accounts and authentication. Registration checks if the email already exists, hashes the password with bcrypt, saves the user with TypeORM, and returns a JWT. Login checks email/password and returns a JWT. Protected routes use a custom JWT guard, and admin-only routes use a roles guard.

## 6. Products Module Documentation

### Responsibility

The products module manages product CRUD. Products belong to users and can have many reviews.

### Files

- `products.module.ts`: registers product dependencies.
- `products.controller.ts`: exposes product endpoints.
- `products.service.ts`: handles product business logic.
- `product.entity.ts`: defines products table.
- `dtos/create-product.dto.ts`: creation validation.
- `dtos/update-product.dto.ts`: update validation.

### Entity / Schema

`Product` table fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | number | Primary generated id |
| `title` | varchar(255) | Product title |
| `description` | text | Nullable |
| `price` | float | Product price |
| `reviews` | relation | One product has many reviews |
| `user` | relation | Product belongs to one user |
| `createdAt` | timestamp | Auto-created |
| `updatedAt` | timestamp | Auto-updated |

### DTOs

`CreateProductDto`:

- `title`: string, not empty, length 2 to 50.
- `description`: string, min length 5 if sent.
- `price`: number, not empty, min 0, max 1000.

`UpdateProductDto`:

- `title`: optional string, not empty if sent, length 2 to 50.
- `description`: optional string, min length 5.
- `price`: optional number, min 0.

### Controller Endpoints

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/products` | `CreateProduct` | `CreateProductDto`, admin JWT | `create` | Create product |
| GET | `/api/products` | `GetAllProducts` | optional query filters | `findAll` | List/filter products |
| GET | `/api/products/:id` | `GetProductById` | id | `findOne` | Get one product |
| PUT | `/api/products/:id` | `updateProduct` | id, `UpdateProductDto`, admin JWT | `update` | Update product |
| DELETE | `/api/products/:id` | `deleteProduct` | id, admin JWT | `delete` | Delete product |

### Service Methods

`create()`:

- Used by: product create endpoint.
- Input: `CreateProductDto`, user id.
- Logic: verify user, lowercase title, create product with user relation.
- Database operation: `create`, `save`.
- Output: product entity.

`findAll()`:

- Used by: products list endpoint.
- Input: optional title, min price, max price.
- Logic: build TypeORM filters using `Like` and `Between`.
- Database operation: `find`.
- Output: product array.

`findOne()`:

- Used by: get product, update, delete, reviews create/list.
- Input: product id.
- Logic: find product or throw.
- Database operation: `findOne`.
- Output: product entity.

`update()`:

- Used by: product update endpoint.
- Input: id and `UpdateProductDto`.
- Logic: find product, assign update fields, save.
- Database operation: `findOne`, `save`.
- Output: updated product.

`delete()`:

- Used by: product delete endpoint.
- Input: id.
- Logic: find product, remove it.
- Database operation: `remove`.
- Output: success message.

### CRUD Flow

- Create: admin creates product.
- Read: anyone can list/get products.
- Update: admin updates product.
- Delete: admin deletes product.

### Example Requests

Create product:

```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Laptop",
  "description": "Powerful work laptop",
  "price": 999
}
```

Filter products:

```http
GET /api/products?title=lap&minPrice=100&maxPrice=1000
```

### Common Mistakes

- Creating a product without an admin token.
- Sending price as a string instead of a number.
- Expecting one-sided price filtering; current code filters price only when both `minPrice` and `maxPrice` are provided.

### Interview Explanation

The products module manages product CRUD. Product creation is admin-only and links the product to the authenticated admin user. Products are stored with TypeORM, can be filtered by title and price range, and are related to reviews using a one-to-many relationship.

## 7. Reviews Module Documentation

### Responsibility

The reviews module lets authenticated users create reviews for products, read reviews, update their own reviews, and delete reviews if they are the owner or an admin.

### Files

- `reviews.module.ts`: registers review dependencies.
- `reviews.controller.ts`: exposes review endpoints.
- `reviews.service.ts`: handles review business logic.
- `review.entity.ts`: defines reviews table.
- `dtos/create-review.dto.ts`: creation validation.
- `dtos/update-review.dto.ts`: update validation.

### Entity / Schema

`Review` table fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | number | Primary generated id |
| `rating` | int | Intended 1 to 5 |
| `comment` | varchar(1000) | Review text |
| `product` | relation | Many reviews belong to one product |
| `user` | relation | Many reviews belong to one user |
| `createdAt` | timestamp | Auto-created |
| `updatedAt` | timestamp | Auto-updated |

Relationships:

- `Review -> Product`: `@ManyToOne`, required, cascade delete.
- `Review -> User`: `@ManyToOne`, required, cascade delete.
- If a product is deleted, related reviews are deleted.
- If a user is deleted, related reviews are deleted.

### DTOs

`CreateReviewDto`:

- `rating`: required integer, min 1, max 5.
- `comment`: required string, min length 2, max length 1000.

`UpdateReviewDto`:

- `rating`: optional integer, min 1, max 5.
- `comment`: optional string, min length 2, max length 1000.

### Controller Endpoints

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/reviews/:productId` | `createReview` | productId, `CreateReviewDto`, JWT | `create` | Create review for product |
| GET | `/api/reviews` | `getAllReviews` | page, limit, admin JWT | `findAll` | Admin list reviews |
| GET | `/api/reviews/product/:productId` | `getReviewsByProductId` | productId | `getByProductId` | Product review list |
| GET | `/api/reviews/:id` | `getReviewById` | id | `findOne` | Get one review |
| PATCH | `/api/reviews/:id` | `updateReview` | id, `UpdateReviewDto`, JWT | `update` | Owner updates review |
| DELETE | `/api/reviews/:id` | `deleteReview` | id, JWT | `delete` | Owner/admin deletes review |

### Service Methods

`create()`:

- Used by: create review endpoint.
- Input: `CreateReviewDto`, user id, product id.
- Logic: verify product and user, create review with relations.
- Database operation: `create`, `save`.
- Output: formatted `ReviewResponse`.

`findOne()`:

- Used by: get review by id endpoint.
- Input: review id.
- Logic: load review with product and user.
- Database operation: `findOne`.
- Output: formatted `ReviewResponse`.

`update()`:

- Used by: update review endpoint.
- Input: review id, JWT payload, `UpdateReviewDto`.
- Logic: owner-only update; apply rating/comment if sent.
- Database operation: `findOne`, `save`.
- Output: formatted `ReviewResponse`.

`delete()`:

- Used by: delete review endpoint.
- Input: review id and JWT payload.
- Logic: allow owner or admin.
- Database operation: `findOne`, `remove`.
- Output: success message.

`getByProductId()`:

- Used by: product reviews endpoint.
- Input: product id.
- Logic: verify product exists; find reviews for product.
- Database operation: `find`.
- Output: formatted reviews.

`findAll()`:

- Used by: admin reviews endpoint.
- Input: page and limit.
- Logic: calculate skip/take and order newest first.
- Database operation: `find`.
- Output: formatted reviews.

### CRUD Flow

- Create: authenticated user/admin creates review for a product.
- Read: anyone can read one review or product reviews; admin can read all reviews.
- Update: authenticated owner updates review.
- Delete: owner or admin deletes review.

### Example Requests

Create review:

```http
POST /api/reviews/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Nice product"
}
```

Example response:

```json
{
  "id": 10,
  "rating": 4,
  "comment": "Nice product",
  "createdAt": "2026-05-31T12:00:00.000Z",
  "updatedAt": "2026-05-31T12:00:00.000Z",
  "product": {
    "id": 1,
    "title": "laptop"
  },
  "user": {
    "id": 7,
    "username": "ahmed"
  }
}
```

### Common Mistakes

- Creating a review without a valid JWT.
- Sending rating outside 1 to 5.
- Trying to update another user's review.
- Forgetting `GET /api/reviews` is admin-only.
- Assuming duplicate reviews are prevented; current code does not prevent the same user from reviewing the same product multiple times.

### Interview Explanation

The reviews module connects users and products. A review belongs to one user and one product. When a review is created, the service checks that the product exists and that the authenticated user exists, then saves the review with both relations. Users can update only their own reviews, while deletion is allowed for the owner or an admin.

## 8. Database Layer Explanation

This project uses PostgreSQL with TypeORM.

### Connection

The connection is configured in `AppModule` using `TypeOrmModule.forRootAsync()` and `ConfigService`.

Environment variables used:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Entities

Entities are classes decorated with `@Entity()`. TypeORM maps them to tables:

- `@Entity('users')` -> `users`
- `@Entity('products')` -> `products`
- `@Entity('reviews')` -> `reviews`

### Repositories

Repositories are injected with:

```ts
@InjectRepository(User) private userRepository: Repository<User>
```

The project uses these TypeORM methods:

- `create()`: creates an entity instance in memory.
- `save()`: inserts or updates a record.
- `find()`: gets many records.
- `findOne()`: gets one record.
- `delete()`: deletes by criteria without loading full entity.
- `remove()`: removes a loaded entity.

### Relations

User relationships:

- One user has many products.
- One user has many reviews.

Product relationships:

- One product belongs to one user.
- One product has many reviews.

Review relationships:

- Many reviews belong to one product.
- Many reviews belong to one user.

### Saving Data

For product creation:

1. User is loaded.
2. Product entity is created with `user`.
3. TypeORM saves product and stores the user foreign key.

For review creation:

1. Product is loaded.
2. User is loaded.
3. Review entity is created with both relations.
4. TypeORM saves review and stores foreign keys.

### Querying Data

Reviews explicitly load relations:

```ts
relations: ['product', 'user']
```

Products use eager relations in the entity:

```ts
@OneToMany(() => Review, (review) => review.product, { eager: true })
reviews: Review[];
```

## 9. DTOs And Validation Explanation

DTOs define incoming request shapes and validation rules.

Validation works because `main.ts` uses global `ValidationPipe`:

- `whitelist: true`: removes properties not in the DTO.
- `forbidNonWhitelisted: true`: rejects unknown properties.
- `transform: true`: converts request values when possible.
- `enableImplicitConversion: true`: helps convert primitive values.

### User DTOs

| DTO | Endpoint | Fields | Rules |
| --- | --- | --- | --- |
| `RegisterDto` | `POST /api/users/auth/register` | email, password, username | email valid; password min 5; username optional length 2-150 |
| `LoginDto` | `POST /api/users/auth/login` | email, password | email valid; password min 5 |
| `UpdateUserDto` | `PATCH /api/users/update` | password, username | both optional; password min 5; username length 2-150 |

### Product DTOs

| DTO | Endpoint | Fields | Rules |
| --- | --- | --- | --- |
| `CreateProductDto` | `POST /api/products` | title, description, price | title length 2-50; description min 5; price 0-1000 |
| `UpdateProductDto` | `PUT /api/products/:id` | title, description, price | all optional; title length 2-50; price min 0 |

### Review DTOs

| DTO | Endpoint | Fields | Rules |
| --- | --- | --- | --- |
| `CreateReviewDto` | `POST /api/reviews/:productId` | rating, comment | rating int 1-5; comment length 2-1000 |
| `UpdateReviewDto` | `PATCH /api/reviews/:id` | rating, comment | both optional; same validation when sent |

### Create DTO vs Update DTO

Create DTOs usually require fields because a new record needs enough data to exist.

Update DTOs usually make fields optional because the client may update only one field.

### PartialType

`PartialType` is not used in the current project. It could reduce duplication by creating update DTOs from create DTOs.

## 10. Controllers Explanation

### Users Controller

Route prefix: `/api/users`

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/register` | `register` | `RegisterDto` | `register` | Register user |
| POST | `/auth/login` | `login` | `LoginDto` | `login` | Login user |
| GET | `/current-user` | `getCurrentUser` | JWT payload | `getCurrentUser` | Get logged-in user |
| GET | `/all` | `getAllUsers` | admin JWT | `getAllUsers` | List users |
| PATCH | `/update` | `updateUser` | JWT payload, `UpdateUserDto` | `updateUser` | Update own user |
| DELETE | `/:id` | `deleteUser` | id, JWT payload | `deleteUser` | Delete user |

### Products Controller

Route prefix: `/api/products`

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/` | `CreateProduct` | `CreateProductDto`, admin JWT | `create` | Create product |
| GET | `/` | `GetAllProducts` | title, minPrice, maxPrice | `findAll` | List/filter products |
| GET | `/:id` | `GetProductById` | id | `findOne` | Get product |
| PUT | `/:id` | `updateProduct` | id, `UpdateProductDto`, admin JWT | `update` | Update product |
| DELETE | `/:id` | `deleteProduct` | id, admin JWT | `delete` | Delete product |

### Reviews Controller

Route prefix: `/api/reviews`

| Method | Endpoint | Controller Method | DTO/Params | Service Method | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/:productId` | `createReview` | productId, `CreateReviewDto`, JWT | `create` | Create review |
| GET | `/` | `getAllReviews` | page, limit, admin JWT | `findAll` | List all reviews |
| GET | `/product/:productId` | `getReviewsByProductId` | productId | `getByProductId` | List product reviews |
| GET | `/:id` | `getReviewById` | id | `findOne` | Get review |
| PATCH | `/:id` | `updateReview` | id, `UpdateReviewDto`, JWT | `update` | Update review |
| DELETE | `/:id` | `deleteReview` | id, JWT | `delete` | Delete review |

## 11. Services Explanation

### UsersService

## `register()`

- Used by: `POST /api/users/auth/register`.
- Input: `RegisterDto`.
- Logic: forwards to `AuthProvider.register`.
- Database operation: handled by auth provider.
- Output: access token.
- Notes: registration returns token, not the full user.

## `login()`

- Used by: `POST /api/users/auth/login`.
- Input: `LoginDto`.
- Logic: forwards to `AuthProvider.login`.
- Database operation: handled by auth provider.
- Output: access token.

## `getCurrentUser()`

- Used by: current user endpoint, products service, reviews service.
- Input: user id.
- Logic: find user or throw.
- Database operation: `findOne`.
- Output: user.

## `getAllUsers()`

- Used by: admin users endpoint.
- Input: none.
- Logic: return all users.
- Database operation: `find`.
- Output: array of users.

## `updateUser()`

- Used by: update user endpoint.
- Input: user id and update DTO.
- Logic: update username/password; hash password.
- Database operation: `findOne`, `save`.
- Output: updated user.

## `deleteUser()`

- Used by: delete user endpoint.
- Input: target user id and JWT payload.
- Logic: only admin or self can delete.
- Database operation: `findOne`, `delete`.
- Output: success message.

### AuthProvider

## `register()`

- Used by: `UsersService.register`.
- Input: `RegisterDto`.
- Logic: prevent duplicate email, hash password, save user, generate JWT.
- Database operation: `findOne`, `create`, `save`.
- Output: access token.

## `login()`

- Used by: `UsersService.login`.
- Input: `LoginDto`.
- Logic: find user, compare bcrypt password, generate JWT.
- Database operation: `findOne`.
- Output: access token.

## `hashPassword()`

- Used by: register and update user.
- Input: plain password.
- Logic: generate salt and hash.
- Database operation: none.
- Output: hashed password.

### ProductsService

## `create()`

- Used by: `POST /api/products`.
- Input: product DTO and user id.
- Logic: find user, lowercase title, create product.
- Database operation: `create`, `save`.
- Output: product.

## `findAll()`

- Used by: `GET /api/products`.
- Input: optional title, minPrice, maxPrice.
- Logic: build filters.
- Database operation: `find`.
- Output: products.

## `findOne()`

- Used by: get/update/delete product and reviews service.
- Input: product id.
- Logic: find product or throw.
- Database operation: `findOne`.
- Output: product.

## `update()`

- Used by: `PUT /api/products/:id`.
- Input: id and update DTO.
- Logic: load product, assign updates, save.
- Database operation: `save`.
- Output: updated product.

## `delete()`

- Used by: `DELETE /api/products/:id`.
- Input: product id.
- Logic: load product, remove it.
- Database operation: `remove`.
- Output: success message.

### ReviewsService

## `create()`

- Used by: `POST /api/reviews/:productId`.
- Input: create DTO, user id, product id.
- Logic: find product and user, create review relation.
- Database operation: `create`, `save`.
- Output: review response.

## `findOne()`

- Used by: `GET /api/reviews/:id`.
- Input: review id.
- Logic: load review and format response.
- Database operation: `findOne`.
- Output: review response.

## `update()`

- Used by: `PATCH /api/reviews/:id`.
- Input: review id, JWT payload, update DTO.
- Logic: owner-only update.
- Database operation: `findOne`, `save`.
- Output: review response.

## `delete()`

- Used by: `DELETE /api/reviews/:id`.
- Input: review id and JWT payload.
- Logic: owner or admin can delete.
- Database operation: `remove`.
- Output: success message.

## `getByProductId()`

- Used by: `GET /api/reviews/product/:productId`.
- Input: product id.
- Logic: verify product exists and fetch related reviews.
- Database operation: `find`.
- Output: review responses.

## `findAll()`

- Used by: `GET /api/reviews`.
- Input: page and limit.
- Logic: pagination with skip/take.
- Database operation: `find`.
- Output: review responses.

## 12. CRUD Pattern Summary

Reusable NestJS CRUD pattern:

1. Create module: `nest g module categories`.
2. Create entity: define table columns and relations.
3. Create DTOs: one for create, one for update.
4. Create service: inject repository and write business logic.
5. Create controller: define HTTP endpoints.
6. Register module: import it in `AppModule`.
7. Add validation: use DTO decorators and global `ValidationPipe`.
8. Test endpoints: use REST client, Postman, or automated tests.

For a new resource like categories:

- `categories.module.ts`
- `category.entity.ts`
- `dtos/create-category.dto.ts`
- `dtos/update-category.dto.ts`
- `categories.service.ts`
- `categories.controller.ts`

Then repeat:

- `POST /api/categories`
- `GET /api/categories`
- `GET /api/categories/:id`
- `PUT/PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

## 13. API Endpoints Documentation

## `POST /api/users/auth/register`

Description: Register a new user and return JWT.

Request Body:

```json
{
  "email": "ahmed@example.com",
  "password": "12345",
  "username": "ahmed"
}
```

Response:

```json
{
  "accessToken": "jwt-token"
}
```

Possible Errors:

- `400 Bad Request`: email already exists.
- `400 Bad Request`: validation failed.

Flow: controller -> users service -> auth provider -> user repository -> JWT.

## `POST /api/users/auth/login`

Description: Login and return JWT.

Request Body:

```json
{
  "email": "ahmed@example.com",
  "password": "12345"
}
```

Response:

```json
{
  "accessToken": "jwt-token"
}
```

Possible Errors:

- `400 Bad Request`: email or password incorrect.
- `400 Bad Request`: validation failed.

## `GET /api/users/current-user`

Description: Get authenticated user profile.

Headers:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "id": 1,
  "email": "ahmed@example.com",
  "username": "ahmed",
  "userType": "user",
  "isAccountVerified": false
}
```

Possible Errors:

- `401 Unauthorized`: missing or invalid token.
- `404 Not Found`: user not found.

## `GET /api/users/all`

Description: Admin-only list of users.

Headers: `Authorization: Bearer <admin-token>`

Possible Errors:

- `401 Unauthorized`: missing or invalid token.
- `403 Forbidden`: not admin.

## `PATCH /api/users/update`

Description: Update current authenticated user.

Request Body:

```json
{
  "username": "new-name",
  "password": "new-password"
}
```

Possible Errors:

- `401 Unauthorized`: missing or invalid token.
- `404 Not Found`: user not found.
- `400 Bad Request`: validation failed.

## `DELETE /api/users/:id`

Description: Delete user as self or admin.

Params:

- `id`: user id.

Response:

```json
{
  "message": "User deleted successfully"
}
```

Possible Errors:

- `401 Unauthorized`: missing or invalid token.
- `403 Forbidden`: not self or admin.
- `404 Not Found`: user not found.

## `POST /api/products`

Description: Admin creates product.

Request Body:

```json
{
  "title": "Laptop",
  "description": "Powerful work laptop",
  "price": 999
}
```

Possible Errors:

- `401 Unauthorized`: missing or invalid token.
- `403 Forbidden`: not admin.
- `400 Bad Request`: validation failed.

## `GET /api/products`

Description: List products, optionally filtered.

Query params:

- `title`
- `minPrice`
- `maxPrice`

Example:

```http
GET /api/products?title=lap&minPrice=100&maxPrice=1000
```

## `GET /api/products/:id`

Description: Get product by id.

Possible Errors:

- `404 Not Found`: product not found.
- `400 Bad Request`: id is not a number.

## `PUT /api/products/:id`

Description: Admin updates product.

Request Body:

```json
{
  "title": "Updated Laptop",
  "price": 899
}
```

Possible Errors:

- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `400 Bad Request`

## `DELETE /api/products/:id`

Description: Admin deletes product.

Response:

```json
{
  "message": "Product with ID 1 deleted successfully"
}
```

## `POST /api/reviews/:productId`

Description: Create review for product.

Request Body:

```json
{
  "rating": 5,
  "comment": "Excellent product"
}
```

Possible Errors:

- `401 Unauthorized`
- `404 Not Found`: product or user not found.
- `400 Bad Request`: validation failed.

Flow: controller -> reviews service -> products service -> users service -> review repository.

## `GET /api/reviews`

Description: Admin-only paginated review list.

Query params:

- `page`: default 1.
- `limit`: default 10.

Example:

```http
GET /api/reviews?page=1&limit=10
```

## `GET /api/reviews/product/:productId`

Description: Get reviews for one product.

Possible Errors:

- `404 Not Found`: product not found.
- `400 Bad Request`: product id is not a number.

## `GET /api/reviews/:id`

Description: Get one review.

Possible Errors:

- `404 Not Found`: review not found.
- `400 Bad Request`: id is not a number.

## `PATCH /api/reviews/:id`

Description: Update own review.

Request Body:

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

Possible Errors:

- `401 Unauthorized`
- `403 Forbidden`: not review owner.
- `404 Not Found`: review not found.
- `400 Bad Request`: validation failed.

## `DELETE /api/reviews/:id`

Description: Delete review as owner or admin.

Response:

```json
{
  "message": "Review deleted successfully"
}
```

Possible Errors:

- `401 Unauthorized`
- `403 Forbidden`: not owner or admin.
- `404 Not Found`: review not found.

## 14. Error Handling

Current exceptions used:

- `BadRequestException`: duplicate user, wrong login credentials.
- `UnauthorizedException`: missing token, invalid token type, invalid token.
- `ForbiddenException`: wrong role, not allowed to delete/update.
- `NotFoundException`: missing user, product, review, or current user payload.

Validation errors:

- DTO validation failures are handled by Nest's `ValidationPipe`.
- Invalid numeric params are handled by `ParseIntPipe`.

Missing / Recommended Improvements:

- Add a global exception filter for consistent error response shape.
- Add `ConflictException` for duplicate email instead of `BadRequestException`.
- Add pagination metadata, not just arrays.
- Add duplicate review protection.
- Make admin review update behavior consistent with route access.

## 15. What I Have Learned From This Project

NestJS concepts learned:

- Modules group features.
- Controllers define routes.
- Services hold business logic.
- Providers can be injected.
- Guards protect routes.
- Decorators make code declarative.
- Pipes validate and transform data.
- Interceptors can transform responses or log requests.

Backend concepts learned:

- REST endpoints.
- Authentication with JWT.
- Authorization with roles.
- Password hashing with bcrypt.
- Request/response flow.
- Environment-based config.

Database concepts learned:

- Entities become tables.
- Repositories perform database operations.
- Relations connect tables.
- Cascading deletes can clean dependent records.

CRUD concepts learned:

- Create uses DTO -> service -> repository save.
- Read uses repository find/findOne.
- Update loads record, modifies fields, saves.
- Delete removes or deletes records.

Validation concepts learned:

- DTOs keep request bodies clean.
- Validation decorators define rules.
- Global validation applies everywhere.

## 16. Interview Explanation

### Short Version

I built a NestJS CRUD API for users, products, and reviews using PostgreSQL and TypeORM. It supports authentication with JWT, role-based access with guards, DTO validation, and relational data between users, products, and reviews.

### Medium Version

This project is a NestJS backend API organized into users, products, and reviews modules. Each module has its own controller, service, DTOs, and TypeORM entity. Users can register and login with JWT authentication. Admin users can manage products and list users/reviews. Reviews connect users and products with TypeORM relationships, and the service layer enforces ownership rules for update/delete operations.

### Technical Version

The application starts in `main.ts`, where a global `ValidationPipe` validates DTOs and transforms params. `AppModule` loads environment config, configures TypeORM for PostgreSQL, registers the entities, and applies `ClassSerializerInterceptor`. Feature modules register repositories through `TypeOrmModule.forFeature`. Controllers expose REST endpoints, guards enforce JWT and roles, and services contain business logic. TypeORM repositories are used for `create`, `save`, `find`, `findOne`, `delete`, and `remove`. Relationships are modeled with `OneToMany` and `ManyToOne` between users, products, and reviews.

### Common Interview Answers

Why did you use modules?

Modules organize the app by feature. Users, products, and reviews each have separate files and dependencies, which makes the code easier to maintain.

What is the role of controllers?

Controllers receive HTTP requests, read params/body/query/current user, and call services.

What is the role of services?

Services contain business logic and database operations. They keep controllers thin.

What are DTOs?

DTOs define the request body shape and validation rules.

How does validation work?

DTO decorators from `class-validator` define rules, and global `ValidationPipe` applies those rules before controller logic runs.

How does create user work?

The register endpoint validates the body, checks for duplicate email, hashes the password, saves the user, and returns a JWT.

How does update product work?

The admin sends a `PUT /api/products/:id` request. The controller validates id and body, service finds the product, assigns update fields, and saves it.

How does create review work?

The user sends a review for a product. The service verifies the product and user exist, creates a review linked to both, saves it, and returns a formatted response.

How do relationships work?

TypeORM decorators define relations: user has many products/reviews, product has many reviews, and review belongs to both user and product.

How would you improve this project?

I would add Swagger docs, tests, consistent response formatting, duplicate review prevention, better pagination metadata, migrations, Docker, and a global exception filter.

## 17. Improvement Roadmap

### Stage 1: Clean CRUD Improvements

- Better validation messages.
- Better error handling.
- Consistent response objects.
- Pagination metadata with total count.
- Search/filter/sort improvements.
- Use `ParseIntPipe` on `DELETE /api/users/:id`.

### Stage 2: Authentication & Authorization

- Refresh tokens.
- Email verification.
- Password reset.
- Clear admin update rules for reviews.
- More consistent guard setup across modules.

### Stage 3: Production Readiness

- Swagger documentation.
- Docker and docker-compose.
- Database migrations instead of `synchronize`.
- Global exception filter.
- Response interceptor.
- Structured logging.
- Automated unit and e2e tests.

### Stage 4: Advanced Features

- Average product rating.
- Prevent duplicate reviews by same user/product.
- Soft delete.
- Product image uploads.
- Review helpful votes.
- Product categories and orders.

## 18. Rebuild From Scratch Guide

1. Install Nest CLI:

```bash
npm i -g @nestjs/cli
```

2. Create project:

```bash
nest new my-new-app
```

3. Install dependencies:

```bash
npm install @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer @nestjs/jwt bcryptjs
```

4. Configure `.env.development` with database and JWT values.

5. Create users module:

```bash
nest g module users
nest g controller users
nest g service users
```

6. Create `User` entity with id, email, username, password, role, timestamps, and relations.

7. Create user DTOs: register, login, update.

8. Create `AuthProvider` for registration, login, password hashing, and JWT generation.

9. Register `TypeOrmModule.forFeature([User])` and `JwtModule` in `UsersModule`.

10. Add user controller endpoints.

11. Test register and login first.

12. Create products module/controller/service.

13. Create `Product` entity with title, description, price, user relation, review relation.

14. Create product DTOs.

15. Add product CRUD service methods.

16. Protect create/update/delete product with JWT and admin role.

17. Create reviews module/controller/service.

18. Create `Review` entity with rating, comment, product relation, user relation.

19. Create review DTOs.

20. Add review service methods for create, find one, find all, product reviews, update, delete.

21. Add global validation in `main.ts`.

22. Add error handling with Nest exceptions.

23. Test all endpoints with `.http` files or Postman.

## 19. Memory Notes / Cheat Sheet

NestJS request flow:

```text
Request -> Guards -> Pipes/Validation -> Controller -> Service -> Repository -> Database -> Response
```

Module pattern:

```text
module = imports + controllers + providers + exports
```

Controller pattern:

```ts
@Post()
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

Service pattern:

```ts
const entity = this.repository.create(dto);
return this.repository.save(entity);
```

DTO pattern:

```ts
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

Database operation pattern:

- Create: `repository.create()` then `repository.save()`.
- Read many: `repository.find()`.
- Read one: `repository.findOne()`.
- Update: find, modify, `save()`.
- Delete loaded entity: `remove()`.
- Delete by id: `delete(id)`.

Common decorators:

- `@Module()`
- `@Controller()`
- `@Injectable()`
- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
- `@Body()`, `@Param()`, `@Query()`
- `@UseGuards()`
- `@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`
- `@OneToMany()`, `@ManyToOne()`

Common commands:

```bash
npm run start:dev
npm run build
npm run test
npm run lint
```

Common errors:

- `400 Bad Request`: validation failed or bad credentials.
- `401 Unauthorized`: missing/invalid JWT.
- `403 Forbidden`: authenticated but not allowed.
- `404 Not Found`: record does not exist.

## 20. Missing / Recommended Improvements

The current project is functional, but these items are missing or incomplete:

- No Swagger setup yet.
- No global exception filter.
- No automated tests for the implemented modules.
- No database migrations.
- `synchronize` is only safe for development.
- No duplicate review prevention.
- Review update route allows admin at guard level, but service allows only owner.
- `GET /api/users/:id` does not exist, only current user and all users exist.
- `DELETE /api/users/:id` does not use `ParseIntPipe`.
- Product filtering only applies price when both min and max are provided.
- Pagination response does not include total count, current page, or total pages.
- `UpdateUserDto` has duplicate `@IsOptional()` on `username`.
- `ReviewsModule` imports `JwtModule` without async config, while auth verification relies on `ConfigService` in `JWTAuthGuard`.
