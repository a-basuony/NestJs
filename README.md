**Lecture Summary: NestJS Basics - Modules and Controllers**

---

### **1. Opening & Introduction**

- Recap: In the previous lesson, we created a project named "Setup Course".
- Today's Goal: Start writing code and learn key NestJS concepts: **Modules** and **Controllers**.

---

### **2. Project Structure Cleanup**

- Initially had 5 files in the source directory.
- Removed unnecessary files for now:
  - `app.controller.ts` (will discuss controllers later)
  - Test files (will cover unit tests in future lessons)
  - Service file (will cover services later)
- After cleanup, only two core files remain:
  - `app.module.ts` (the main/root module)
  - `main.ts` (application entry point)

---

### **3. Introduction to Modules in NestJS**

- **What is a Module?**
  - NestJS uses a **modular architecture**, breaking the project into separate, independent components.
  - Each module is a self-contained part of the project with a specific responsibility.
  - Example: In our project, we can have separate modules for:
    - **Products**
    - **Reviews**
    - **Users**
- Each module can contain its own:
  - Controllers
  - Services
  - Models/Entities
  - Routes
- The `app.module` is the **root/parent module** that ties all other modules together.

---

### **4. Creating Modules**

**Steps to create a module:**

1. Create a folder inside `src/` (e.g., `product`).
2. Inside the folder, create a file named `<module-name>.module.ts` (e.g., `product.module.ts`).
3. Define a class and export it (e.g., `ProductModule`).
4. Use the `@Module()` decorator (imported from `@nestjs/common`) to mark it as a module.
5. Pass an empty metadata object `{}` to `@Module()` initially.

**Example:**

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class ProductModule {}
```

- Repeat for `review.module.ts` and `user.module.ts`.

---

### **5. Registering Modules in the Root Module**

- NestJS won't recognize other modules until they are imported into the root module (`app.module.ts`).
- **Import the created modules into `app.module.ts`:**

```typescript
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ProductModule, ReviewModule, UserModule],
})
export class AppModule {}
```

- The `main.ts` file bootstraps the `AppModule`, making all registered modules available.

---

### **6. Introduction to Controllers**

- **What is a Controller?**
  - Handles incoming HTTP requests and returns responses.
  - Each route/endpoint logic is written inside a controller.
- **Creating a Controller:**
  1. Inside a module folder (e.g., `product`), create a file named `<name>.controller.ts` (e.g., `product.controller.ts`).
  2. Define a class and export it (e.g., `ProductController`).
  3. Use the `@Controller()` decorator to mark it as a controller.
  4. Define methods to handle specific routes (e.g., `GET /api/products`).

**Example:**

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('api/products')
export class ProductController {
  @Get()
  getProducts() {
    return [
      { id: 1, title: 'Laptop', price: 400 },
      { id: 2, title: 'Phone', price: 300 },
    ];
  }
}
```

---

### **7. Registering Controllers in Modules**

- Controllers must be imported into their respective modules.
- In the module's metadata, add the controller to the `controllers` array.

**Example (in `product.module.ts`):**

```typescript
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
})
export class ProductModule {}
```

---

### **8. Testing the Application**

- Run the NestJS server in watch mode:

```bash
npm run start:dev
```

- The server runs on `http://localhost:5000` (port defined in `main.ts`).
- Use **Postman** to test endpoints:
  - `GET http://localhost:5000/api/products`
  - `GET http://localhost:5000/api/reviews`
  - `GET http://localhost:5000/api/users`

---

### **9. Key Takeaways**

- **Modules** are the building blocks of NestJS, organizing the project into independent, functional units.
- **Controllers** handle HTTP requests and define route endpoints.
- The **root module** (`app.module`) imports all other modules.
- Each module must register its controllers in the `controllers` array.
- Use decorators (`@Module`, `@Controller`, `@Get`) to define modules, controllers, and routes.

---

### **10. Next Steps**

- In future lessons, we will cover:
  - Services
  - Models/Entities
  - Dependency Injection
  - Unit Testing

Thank you, and see you in the next lesson!

**Lecture Summary: Deep Dive into Controllers in NestJS**

---

### **1. Opening & Introduction**

- Recap: Previous lesson covered **Modules** and **Controllers** basics.
- Today's Goal: Deep dive into **Controllers** and implement all CRUD operations.

---

### **2. Starting Point: Product Controller**

- We already have a `ProductController` with a `GET` method (from previous lesson).
- Now we'll implement **POST, PUT/PATCH, and DELETE** methods.

---

### **3. Implementing POST Method (Create Product)**

**Steps:**

1. Create a new public method `createNewProduct()`.
2. Use `@Post()` decorator to handle POST requests.
3. The route path is `api/products` (can be defined at controller level or method level).
4. Need to **extract data from the request body** using `@Body()` decorator.
5. Initially, log the body to see incoming data.

**Example:**

```typescript
@Post()
createNewProduct(@Body() body: any) {
  console.log(body);
  return body;
}
```

**Testing with Postman:**

- Send POST request to `http://localhost:5000/api/products`
- Body (JSON): `{ "title": "Product 1", "price": 200 }`
- Response: Returns the same data with status 201 Created.

---

### **4. Data Transfer Objects (DTOs)**

**Problem:** We need a specific type for the request body (only `title` and `price`, no `id`).
**Solution:** Create a **DTO (Data Transfer Object)**.

**Why DTOs?**

- Define the shape of incoming data
- Separate validation logic
- In NestJS, DTOs are typically **classes** (for future validation with decorators)

**Creating a DTO:**

1. Create folder `dtos` inside `product` module.
2. Create file `create-product.dto.ts`
3. Define a class with the required properties:

```typescript
export class CreateProductDto {
  title: string;
  price: number;
}
```

**Update the controller method:**

```typescript
@Post()
createNewProduct(@Body() body: CreateProductDto) {
  console.log(body);
  // Create product logic here
  return body;
}
```

---

### **5. Implementing Product Creation Logic**

1. Generate a new ID (increment from existing products)
2. Create a new product object
3. Add it to the products array (temporary in-memory storage)
4. Return the created product

**Updated method:**

```typescript
@Post()
createNewProduct(@Body() body: CreateProductDto) {
  const newProduct = {
    id: this.products.length + 1, // Generate ID on server
    title: body.title,
    price: body.price,
  };
  this.products.push(newProduct);
  return newProduct;
}
```

---

### **6. Implementing GET Single Product**

**Goal:** Get a product by ID (`api/products/:id`)

**Steps:**

1. Create method `getSingleProduct()`
2. Use `@Get(':id')` decorator
3. Extract the `id` parameter using `@Param()` decorator
4. Find the product by ID
5. Handle "not found" case

**Example:**

```typescript
@Get(':id')
getSingleProduct(@Param('id') id: string) {
  const productId = parseInt(id);
  const product = this.products.find(p => p.id === productId);

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  return product;
}
```

**Key Points:**

- `@Param('id')` extracts the `id` parameter from the URL
- Convert string ID to number with `parseInt()`
- Use `NotFoundException` for 404 errors (built-in NestJS exception)

---

### **7. Exception Handling in NestJS**

- NestJS has **built-in exception handling**
- No need to write custom middleware for basic error handling
- Built-in exceptions include:
  - `NotFoundException` (404)
  - `BadRequestException` (400)
  - `ForbiddenException` (403)
  - `InternalServerErrorException` (500)

**Using NotFoundException:**

```typescript
throw new NotFoundException('Product not found');
// Or with description:
throw new NotFoundException({
  description: 'Product not found with the given ID',
});
```

---

### **8. Implementing PUT/PATCH Method (Update Product)**

**Goal:** Update a product (`api/products/:id`)

**Steps:**

1. Create method `updateProduct()`
2. Use `@Put(':id')` or `@Patch(':id')` decorator
3. Extract both `id` parameter and request body
4. Create an update DTO (with optional fields)

**Update DTO (`update-product.dto.ts`):**

```typescript
export class UpdateProductDto {
  title?: string; // Optional
  price?: number; // Optional
}
```

**Controller method:**

```typescript
@Put(':id')
updateProduct(
  @Param('id') id: string,
  @Body() body: UpdateProductDto
) {
  const productId = parseInt(id);
  const productIndex = this.products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    throw new NotFoundException('Product not found');
  }

  // Update product logic
  console.log(body);

  return {
    message: 'Product updated successfully',
    id: productId
  };
}
```

---

### **9. Implementing DELETE Method**

**Goal:** Delete a product (`api/products/:id`)

**Steps:**

1. Create method `deleteProduct()`
2. Use `@Delete(':id')` decorator
3. Extract the `id` parameter
4. Remove product from array
5. Return success message

**Example:**

```typescript
@Delete(':id')
deleteProduct(@Param('id') id: string) {
  const productId = parseInt(id);
  const productIndex = this.products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    throw new NotFoundException('Product not found');
  }

  this.products.splice(productIndex, 1);

  return {
    message: 'Product deleted successfully'
  };
}
```

---

### **10. Route Prefix Optimization**

**Instead of repeating `api/products` in every decorator:**

- Define the prefix at the controller level
- Remove duplicate path prefixes from method decorators

**Before:**

```typescript
@Controller()
export class ProductController {
  @Get('api/products')
  getProducts() { ... }

  @Post('api/products')
  createProduct() { ... }
}
```

**After:**

```typescript
@Controller('api/products')
export class ProductController {
  @Get()
  getProducts() { ... }

  @Post()
  createProduct() { ... }

  @Get(':id')
  getSingleProduct(@Param('id') id: string) { ... }

  @Put(':id')
  updateProduct(@Param('id') id: string) { ... }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) { ... }
}
```

---

### **11. Testing All Endpoints**

**Postman Collection Structure:**

```
Nest App
├── Product
│   ├── GET all products
│   ├── POST create product
│   ├── GET single product by ID
│   ├── PUT update product
│   └── DELETE product
├── Review
└── User
```

**Test all endpoints:**

1. `GET /api/products` - Get all products
2. `POST /api/products` - Create new product
3. `GET /api/products/1` - Get product with ID 1
4. `PUT /api/products/1` - Update product with ID 1
5. `DELETE /api/products/1` - Delete product with ID 1

---

### **12. Key Concepts Covered**

**Decorators learned:**

- `@Controller()` - Defines a controller class
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP method handlers
- `@Body()` - Extracts request body
- `@Param()` - Extracts route parameters
- `@Query()` (not shown but exists) - Extracts query parameters

**Other concepts:**

- DTOs (Data Transfer Objects)
- Built-in exception handling
- Route prefix optimization
- Type safety with TypeScript

---

### **13. Next Steps**

- In future lessons: Services, Dependency Injection, Database integration, Validation, and more advanced topics.

**Thank you, and see you in the next lesson!**

## **The Missing Code: Products Array Declaration**

This part comes **inside the ProductController class**, before any methods. Here's the complete context:

```typescript
// First, create a ProductType interface/type at the top
type ProductType = {
  id: number;
  title: string; // Note: The instructor uses 'title', not 'name'
  price: number;
};

@Controller('api/products')
export class ProductController {
  // This is the products array that was referenced but not explicitly shown
  private products: ProductType[] = [
    { id: 1, title: 'Laptop', price: 400 },
    { id: 2, title: 'Phone', price: 300 },
  ];

  // Then your methods come after...
  @Get()
  getProducts() {
    return this.products;
  }

  // ... other methods
}
```

## **Why It Wasn't Explicitly Mentioned in the Transcript:**

In the Arabic lecture transcript, the instructor said:

> "كنترول اكس واخليه هنا اعمل برتي برايفت اسميه بروكت يساوي..."

Which translates to: "Control X and leave it here, make a private property named product equals..."

But then he quickly moved on without showing the actual array initialization. He was referring to creating the `private products` array property that he was already using in his code.

## **Complete ProductController Example:**

Here's what the **full ProductController** should look like with the array:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

type ProductType = {
  id: number;
  title: string;
  price: number;
};

@Controller('api/products')
export class ProductController {
  // THIS IS THE MISSING PART
  private products: ProductType[] = [
    { id: 1, title: 'Laptop', price: 400 },
    { id: 2, title: 'Phone', price: 300 },
  ];

  @Get()
  getProducts() {
    return this.products;
  }

  @Get(':id')
  getSingleProduct(@Param('id') id: string) {
    const productId = parseInt(id);
    const product = this.products.find((p) => p.id === productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  @Post()
  createNewProduct(@Body() body: CreateProductDto) {
    const newProduct = {
      id: this.products.length + 1,
      title: body.title,
      price: body.price,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const productId = parseInt(id);
    const productIndex = this.products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      throw new NotFoundException('Product not found');
    }

    // Update the product
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...body, // Override with new values
    };

    return this.products[productIndex];
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    const productId = parseInt(id);
    const productIndex = this.products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      throw new NotFoundException('Product not found');
    }

    this.products.splice(productIndex, 1);

    return { message: 'Product deleted successfully' };
  }
}
```

## **Key Points:**

1. **Array is declared as a private class property** - `private products: ProductType[]`
2. **Initialized with sample data** - Hardcoded products for testing
3. **Stored in memory** - This is temporary (will be replaced with a database later)
4. **Used by all methods** - All CRUD operations manipulate this array
5. **Type safety** - Uses the `ProductType` type definition

The instructor assumed this was understood from context when he was showing the `getProducts()` method returning `this.products`, but didn't explicitly show the array initialization in the transcript.

**Lecture Summary: Express.js Under the Hood & Advanced Decorators in NestJS**

---

### **1. Opening & Introduction**

- Previously mentioned: NestJS uses **Express.js** under the hood to handle HTTP requests/responses.
- Today's Goal: Demonstrate how NestJS works with Express and show advanced decorators.

---

### **2. NestJS Underlying Frameworks**

**Default: Express.js**

- NestJS uses Express.js by default as its HTTP platform
- Express handles HTTP requests and responses behind the scenes
- When you create a NestJS project, Express is installed automatically

**Alternative: Fastify**

- NestJS also supports **Fastify** as an alternative HTTP platform
- Fastify is a web framework for Node.js (like Express but faster)
- According to benchmarks:
  - Express 4.17.3: ~14,000 requests/second
  - Fastify: ~77,000 requests/second (much faster)
- You can switch to Fastify by changing configuration settings
- **In this course:** We'll stick with Express (default and more common)

---

### **3. Express-style Request Handling in NestJS**

**Goal:** Write a route handler using Express-style syntax to understand what happens behind the scenes.

**Example: Express-style POST handler**

```typescript
import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('api/products/express-way')
export class ProductController {
  @Post()
  createNewProductExpressWay(@Req() req: Request, @Res() res: Response) {
    const body = req.body; // Extract body from request
    const newProduct = {
      id: 1,
      title: body.title,
      price: body.price,
    };

    // Express-style response
    res.status(201).json(newProduct);
  }
}
```

**Key Points:**

- `@Req()` decorator gives access to the Express `Request` object
- `@Res()` decorator gives access to the Express `Response` object
- Import `Request` and `Response` types from `express`
- This is the **Express way** of handling requests

---

### **4. NestJS Default Way vs Express Way**

**Default NestJS Way (Recommended):**

```typescript
@Post()
createNewProduct(@Body() body: CreateProductDto) {
  const newProduct = {
    id: 1,
    title: body.title,
    price: body.price,
  };
  return newProduct; // Automatic 201 status
}
```

**What happens behind the scenes:**

1. `@Body()` decorator extracts `req.body` internally
2. NestJS automatically sets status code (201 for POST)
3. Automatic JSON serialization
4. Cleaner, more declarative code

**Why use NestJS way?**

- Best practice in NestJS
- Cleaner code
- Less boilerplate
- Better integration with NestJS features

---

### **5. When to Use @Req() and @Res()**

**You might need @Req() and @Res() when:**

1. **Setting cookies:**

```typescript
@Post('login')
login(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response
) {
  // Set a cookie
  res.cookie('auth-cookie', 'token123', {
    httpOnly: true,
    maxAge: 120000,
  });

  return { message: 'Login successful' };
}
```

2. **Accessing headers:**

```typescript
@Get()
getProducts(@Headers() headers: any) {
  console.log(headers);
  // Or using @Req():
  // console.log(req.headers);
  return this.products;
}
```

3. **Need low-level access to request/response objects**

---

### **6. @Headers() Decorator**

**Access request headers easily:**

```typescript
import { Controller, Get, Headers } from '@nestjs/common';

@Controller('api/products')
export class ProductController {
  @Get()
  getProducts(@Headers() headers: any) {
    console.log('Headers:', headers);

    // Access specific headers
    const authorization = headers['authorization'];
    const userAgent = headers['user-agent'];

    return this.products;
  }
}
```

**Testing with Postman:**

- Add headers like:
  - `Authorization: Bearer token123`
  - `X-User-Name: Yusuf`
- These will be accessible via `@Headers()`

**Alternative: Using @Req()**

```typescript
@Get()
getProducts(@Req() req: Request) {
  console.log(req.headers); // Same result
  return this.products;
}
```

**Best Practice:** Use `@Headers()` for specific header access, it's cleaner and more declarative.

---

### **7. Key Decorators Covered**

1. **`@Req()`** - Express Request object
2. **`@Res()`** - Express Response object
3. **`@Headers()`** - Request headers object
4. **`@Body()`** - Request body (NestJS preferred way)
5. **`@Param()`** - Route parameters
6. **`@Query()`** - Query parameters

---

### **8. Testing the Express-style Handler**

**Postman Request:**

```
POST http://localhost:5000/api/products/express-way
Content-Type: application/json

{
  "title": "Product Express",
  "price": 250
}
```

**Response:**

```json
{
  "id": 1,
  "title": "Product Express",
  "price": 250
}
```

Status: 201 Created

---

### **9. Important Notes**

1. **Don't mix approaches** - Stick to NestJS way for consistency
2. **Use @Req()/@Res() sparingly** - Only when you need low-level access
3. **Pass-through mode** - Use `@Res({ passthrough: true })` when you want to use `@Res()` but still return data normally
4. **Behind the scenes** - NestJS decorators like `@Body()` use Express objects internally

---

### **10. Key Takeaways**

- NestJS uses **Express.js** by default (can switch to Fastify)
- You can write **Express-style handlers** using `@Req()` and `@Res()`
- **Preferred approach**: Use NestJS decorators (`@Body()`, `@Headers()`, etc.)
- **Use cases for @Req()/@Res()**: Cookies, headers, low-level access
- **Behind the scenes**: NestJS decorators wrap Express functionality

---

**Thank you, and see you in the next lesson!**
**Lecture Summary: Pipes in NestJS & Request Lifecycle**

---

### **1. Opening & Introduction**

- Today's Topic: **Pipes** in NestJS
- First, understand the **NestJS Request-Response Lifecycle**

---

### **2. NestJS Request-Response Lifecycle**

**The Journey of a Request:**
When a client sends a request to a NestJS server, it passes through several **layers** before reaching the route handler:

```
Client Request → Middleware → Guard → Interceptor → Pipe → Route Handler → Interceptor → Client Response
```

**Order of Layers:**

1. **Middleware** - First layer, handles cross-cutting concerns
2. **Guard** - Authorization checks (e.g., authentication, roles)
3. **Interceptor** - Runs BEFORE the route handler
4. **Pipe** - Data transformation & validation
5. **Route Handler** - Controller method that processes the request
6. **Interceptor** - Runs AFTER the route handler
7. **Exception Filter** - Catches any exceptions (if they occur)

**Key Points:**

- **Interceptor** runs both BEFORE and AFTER the route handler
- **Exception Filter** only runs if an exception occurs
- Each layer has a specific responsibility

---

### **3. Exception Filters**

- **Purpose:** Catch exceptions anywhere in the lifecycle (middleware, guard, interceptor, pipe, route handler)
- **Built-in in NestJS:** No need to write custom error-handling middleware like in Express
- **Function:** Converts exceptions to proper JSON responses with status codes and messages
- **Example:** When `NotFoundException` is thrown, Exception Filter catches it and returns 404 status with message

---

### **4. Introduction to Pipes**

**What are Pipes?**

- Pipes run **BEFORE the route handler**
- Two main use cases:
  1. **Transformation** - Convert data from one type to another
  2. **Validation** - Check if data is valid (more common)

**Built-in Pipes in NestJS:**
NestJS provides 9 built-in pipes:

1. `ParseIntPipe` - Converts string to integer
2. `ParseFloatPipe` - Converts string to float
3. `ParseBoolPipe` - Converts string to boolean
4. `ParseArrayPipe` - Converts string to array
5. `ParseUUIDPipe` - Validates UUID
6. `ParseEnumPipe` - Validates enum values
7. `DefaultValuePipe` - Provides default value
8. `ValidationPipe` - Comprehensive validation
9. Custom Pipes - You can create your own

---

### **5. Why Use Pipes?**

**Problem Scenario:**
When getting a product by ID (`GET /api/products/:id`), the `id` parameter comes as a string from the URL.

**Issues without Pipes:**

1. Client might send `"hello"` instead of a number
2. Route handler still executes (wastes resources)
3. Database query might fail unnecessarily
4. Server resources are wasted on invalid requests

**Solution with Pipes:**

- Validate input BEFORE it reaches the route handler
- Reject invalid requests early
- Save server resources

---

### **6. Practical Example: ParseIntPipe**

**Before (Without Pipe):**

```typescript
@Get(':id')
getSingleProduct(@Param('id') id: string) {
  console.log(typeof id); // Shows "string"
  const productId = parseInt(id); // Manual conversion

  // Route handler executes even if id is invalid
  const product = this.products.find(p => p.id === productId);

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  return product;
}
```

**Problem:** If client sends `GET /api/products/hello`, the route handler still executes, converts "hello" to `NaN`, searches for product with ID `NaN`, then throws 404.

**After (With ParseIntPipe):**

```typescript
import { ParseIntPipe } from '@nestjs/common';

@Get(':id')
getSingleProduct(@Param('id', ParseIntPipe) id: number) {
  // id is already a number here!
  console.log(typeof id); // Shows "number"

  const product = this.products.find(p => p.id === id);

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  return product;
}
```

**What ParseIntPipe does:**

1. Validates that the parameter is a valid integer string
2. Converts string to number automatically
3. Throws `BadRequestException` (400) if invalid
4. **Route handler doesn't execute if validation fails**

---

### **7. Testing with Postman**

**Valid Request:**

```
GET http://localhost:5000/api/products/2
```

- Response: 200 OK with product data
- `id` parameter is automatically converted to number

**Invalid Request:**

```
GET http://localhost:5000/api/products/hello
```

- Response: 400 Bad Request
- Error message: "Validation failed (numeric string is expected)"
- **Route handler never executes**
- **Saves server resources**

---

### **8. Other Built-in Pipes**

**ParseFloatPipe:**

```typescript
@Get('price/:price')
getByPrice(@Param('price', ParseFloatPipe) price: number) {
  // Handles decimal numbers: "2.5" → 2.5
}
```

**ParseBoolPipe:**

```typescript
@Get('status/:active')
getByStatus(@Param('active', ParseBoolPipe) active: boolean) {
  // Converts: "true" → true, "false" → false
}
```

**DefaultValuePipe:**

```typescript
@Get()
getProducts(@Query('page', new DefaultValuePipe(1)) page: number) {
  // If no page query param, defaults to 1
}
```

---

### **9. How It Works with Exception Filters**

**Flow when using ParseIntPipe with invalid input:**

1. Client sends `GET /api/products/hello`
2. `ParseIntPipe` validates `"hello"`
3. Pipe determines it's not a valid integer
4. Pipe throws `BadRequestException`
5. **Route handler is NOT executed**
6. Exception Filter catches the exception
7. Returns 400 Bad Request with error message
8. Server resources saved

---

### **10. Key Takeaways**

1. **Request Lifecycle:** Request passes through multiple layers in specific order
2. **Pipes Purpose:** Transform and validate data BEFORE route handler
3. **Early Rejection:** Invalid requests are rejected early, saving resources
4. **Built-in Pipes:** NestJS provides 9 pipes for common use cases
5. **ParseIntPipe:** Converts and validates string to integer
6. **Exception Handling:** Exception Filters automatically handle pipe validation errors
7. **Resource Optimization:** Pipes prevent unnecessary database queries and processing

---

### **11. Next Steps**

- Future lessons will cover:
  - Custom Pipes
  - ValidationPipe with class-validator
  - Other built-in pipes in detail
  - Guards, Interceptors, and Middleware

**Thank you, and see you in the next lesson!**

**Lecture Summary: Using REST Client Extension in VS Code**

---

### **1. Introduction to REST Client**

- Alternative to **Postman** for testing APIs
- **REST Client** is a VS Code extension
- Useful in countries where Postman might be restricted
- Test your APIs directly from VS Code

---

### **2. Installing REST Client**

1. Open VS Code Extensions
2. Search for "**REST Client**"
3. Install the extension by Huachao Mao
4. After installation, you'll see REST Client features in VS Code

---

### **3. Setting Up REST Client Files**

1. Create a new folder in your project root (e.g., `rest-client`)
2. Create files with extension `.http` or `.rest`
   - Example: `product-api.http`
3. Each file can contain multiple API requests

---

### **4. Writing Your First Request**

**Basic GET Request:**

```http
GET http://localhost:5000/api/products
```

- Single space after `GET`
- Full URL including protocol
- Press **"Send Request"** button that appears above the request

**Response Display:**

- Response appears in a split pane
- Shows: Status code, headers, and body
- Similar to Postman's response view

---

### **5. Multiple Request Types**

**GET Single Product:**

```http
GET http://localhost:5000/api/products/1
```

**POST Request (Create Product):**

```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "Product 1",
  "price": 100
}
```

**Important for POST/PUT:**

1. Blank line after headers
2. JSON body after blank line
3. Must specify `Content-Type: application/json`

**PUT Request (Update):**

```http
PUT http://localhost:5000/api/products/1
Content-Type: application/json

{
  "title": "Updated Product"
}
```

**DELETE Request:**

```http
DELETE http://localhost:5000/api/products/1
```

- No Content-Type needed for DELETE without body

---

### **6. The "Three Hashes" Trick (###)**

**Problem:** REST Client only recognizes **one request** per `.http` file by default.

**Solution:** Use `###` to separate multiple requests:

```http
### Get all products
GET http://localhost:5000/api/products

### Get single product
GET http://localhost:5000/api/products/1

### Create new product
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "New Product",
  "price": 200
}

### Update product
PUT http://localhost:5000/api/products/1
Content-Type: application/json

{
  "title": "Updated Title"
}

### Delete product
DELETE http://localhost:5000/api/products/1
```

**Why `###` works:**

1. Acts as a **separator** between requests
2. Also serves as a **comment** (you can add text after it)
3. Enables multiple "Send Request" buttons in one file

---

### **7. Organizing Your API Tests**

**Option 1: One file per resource**

- `product-api.http` - All product endpoints
- `user-api.http` - All user endpoints
- `review-api.http` - All review endpoints

**Option 2: One file per controller**

- Match your NestJS controller structure
- Easier to maintain as project grows

**Benefits:**

- Team members get all API tests when cloning repo
- No need to manually recreate requests in Postman
- Version controlled with your code

---

### **8. VS Code Icons for NestJS**

**Problem:** VS Code shows Angular icons for NestJS files by default.

**Solution: Change file icon theme:**

1. Go to **File → Preferences → Settings** (or `Ctrl+,`)
2. Search for "**file icon theme**"
3. Change from "Material Icon Theme" to "**NestJS**"
4. Icons will now show NestJS-specific icons instead of Angular icons

**Alternative:** Keep Material Icon Theme but configure it:

1. Search for "**material icon theme**" in settings
2. Find "Angular" and change to "NestJS"
3. This tells the icon pack to recognize NestJS files correctly

---

### **9. Advantages of REST Client**

1. **No external application needed** - Everything in VS Code
2. **Version controlled** - API tests live with your code
3. **Easy sharing** - Team members get tests automatically
4. **Lightweight** - No heavy application to install
5. **Quick testing** - No switching between applications

---

### **10. Practical Example Structure**

**File: `rest-client/product.http`**

```http
### PRODUCT API TESTS

### Get all products
GET http://localhost:5000/api/products

### Get product by ID (valid)
GET http://localhost:5000/api/products/1

### Get product by ID (invalid - should return 400)
GET http://localhost:5000/api/products/hello

### Create product
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "Laptop",
  "price": 999.99
}

### Update product
PUT http://localhost:5000/api/products/1
Content-Type: application/json

{
  "title": "Gaming Laptop",
  "price": 1299.99
}

### Delete product
DELETE http://localhost:5000/api/products/1
```

---

### **11. Testing with REST Client**

1. Click **"Send Request"** above any request
2. Response opens in right pane
3. View status code, headers, and body
4. Test different scenarios (valid/invalid inputs)

**Example Test Flow:**

1. Test GET all - should return 200 with array
2. Test GET with invalid ID - should return 400 (ParseIntPipe validation)
3. Test POST with valid data - should return 201 Created
4. Test PUT with updates - should return 200 OK
5. Test DELETE - should return 200 OK

---

### **12. Key Takeaways**

1. **REST Client** is a great Postman alternative
2. Files use `.http` or `.rest` extension
3. Use `###` to separate multiple requests in one file
4. Remember `Content-Type: application/json` for POST/PUT
5. Blank line between headers and body is crucial
6. Change VS Code icon theme for better NestJS visualization
7. Keep API tests in your repository for team sharing

---

**Thank you, and see you in the next lesson!**
**Lecture Summary: Input Validation with class-validator in NestJS**

---

### **1. Introduction & Problem Statement**

- **Problem**: Our POST endpoint accepts invalid data:
  - Empty titles
  - Negative prices
  - Extra properties we don't expect
- **Solution**: Implement input validation using `class-validator` and `ValidationPipe`

---

### **2. Installing Required Packages**

```bash
npm install class-validator class-transformer
```

- `class-validator`: Provides decorators for validation rules
- `class-transformer`: Transforms plain objects to class instances

---

### **3. Setting Up Validation in DTOs**

**Update `create-product.dto.ts`:**

```typescript
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

**Key Decorators Used:**

1. `@IsString()` - Must be a string
2. `@IsNotEmpty()` - Cannot be empty
3. `@MinLength(2)` - Minimum 2 characters
4. `@MaxLength(150)` - Maximum 150 characters
5. `@IsNumber()` - Must be a number
6. `@Min(0)` - Minimum value of 0

---

### **4. Applying ValidationPipe in Controller**

**Method 1: Apply to specific endpoint**

```typescript
import { ValidationPipe } from '@nestjs/common';

@Post()
createNewProduct(@Body(new ValidationPipe()) body: CreateProductDto) {
  // Validation happens before this code executes
  return this.productsService.create(body);
}
```

**Method 2: Apply globally (Recommended)**
In `main.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
```

---

### **5. Global ValidationPipe Configuration**

**Options Explained:**

```typescript
new ValidationPipe({
  whitelist: true, // Remove properties not in DTO
  forbidNonWhitelisted: true, // Throw error if extra properties exist
  transform: true, // Transform payloads to DTO instances
  disableErrorMessages: false, // Show detailed error messages
});
```

**Why Global is Better:**

1. Applies to all endpoints automatically
2. Consistent validation across entire application
3. Less code duplication
4. Easier to maintain

---

### **6. Testing Validation**

**Test Case 1: Empty Title**

```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "",
  "price": 100
}
```

**Response:** 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "title must be longer than or equal to 2 characters"
  ],
  "error": "Bad Request"
}
```

**Test Case 2: Negative Price**

```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "Product",
  "price": -1
}
```

**Response:** 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["price must not be less than 0"],
  "error": "Bad Request"
}
```

**Test Case 3: Extra Property**

```http
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "title": "Product",
  "price": 100,
  "rating": 5
}
```

**Response:** 400 Bad Request (with `forbidNonWhitelisted: true`)

```json
{
  "statusCode": 400,
  "message": ["property rating should not exist"],
  "error": "Bad Request"
}
```

---

### **7. Update DTO with Optional Fields**

**For PATCH/PUT endpoints (update-product.dto.ts):**

```typescript
import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  title?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
```

**Key Points:**

- `@IsOptional()` makes the field optional
- Fields can be undefined
- Validation only applies if field is provided

---

### **8. Using @Length Decorator**

**Alternative to @MinLength/@MaxLength:**

```typescript
@Length(2, 150)  // Combines min and max length
title: string;
```

**Benefits:**

- Single decorator instead of two
- Cleaner code
- Same functionality

**Choose based on preference:**

- `@Length(2, 150)` - Single decorator
- `@MinLength(2) @MaxLength(150)` - Two decorators (more explicit)

---

### **9. Validation Flow**

**What happens when request arrives:**

1. Request reaches NestJS server
2. Global `ValidationPipe` intercepts request
3. Transforms JSON to DTO class instance
4. Validates against decorator rules
5. If validation fails:
   - Throws `BadRequestException`
   - Returns 400 with error messages
   - **Route handler never executes**
6. If validation passes:
   - Cleaned data passed to route handler
   - Route handler executes normally

---

### **10. Complete Example**

**main.ts with Global Validation:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra properties
      forbidNonWhitelisted: true, // Error on extra properties
      transform: true, // Transform to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  await app.listen(3000);
  console.log(`Server running on http://localhost:3000`);
}
```

**Product DTO:**

```typescript
import { IsString, IsNumber, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  title: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

**Product Controller:**

```typescript
@Controller('products')
export class ProductController {
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    // No need for ValidationPipe here - it's global
    // Data is already validated and transformed
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }
}
```

---

### **11. Key Takeaways**

1. **Install packages**: `class-validator` and `class-transformer`
2. **Create DTO classes**: Define validation rules with decorators
3. **Use global ValidationPipe**: Configure in `main.ts`
4. **Configure options**: `whitelist`, `forbidNonWhitelisted`, `transform`
5. **Handle optional fields**: Use `@IsOptional()` for PATCH endpoints
6. **Validation prevents bugs**: Invalid data never reaches business logic
7. **Clean code**: Validation rules are declarative and readable

---

### **12. Common Validation Decorators**

- `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsArray()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@Min()`, `@Max()`, `@MinLength()`, `@MaxLength()`, `@Length()`
- `@IsEmail()`, `@IsUrl()`, `@IsDate()`
- `@Matches()` - Regular expression validation
- `@IsEnum()` - Validate against enum values
- `@IsObject()`, `@IsInstance()` - Object validation

---

Let me explain each of these concepts in detail:

## **How ValidationPipe Works**

### **1. "Validation happens before this code executes"**

```typescript
@Post()
createNewProduct(@Body(new ValidationPipe()) body: CreateProductDto) {
  // Validation happens BEFORE this code executes
  return this.productsService.create(body);
}
```

**What this means:**

- The `new ValidationPipe()` creates a **pipe instance**
- This pipe **intercepts** the incoming request **BEFORE** it reaches your controller method
- It validates the request body against the rules defined in your DTO
- **Only if validation passes** does your controller code execute
- **If validation fails**, the pipe throws an exception and your controller code never runs

**Visual Flow:**

```
Client Request → ValidationPipe → Controller Method (if valid) → Response
                                ↘ Exception (if invalid) → Error Response
```

**Example:**

```typescript
// Client sends: { "title": "", "price": -100 }
// ValidationPipe checks: title is empty, price is negative
// ValidationPipe throws BadRequestException (400)
// Your createNewProduct() method NEVER executes
// Client gets 400 error response
```

---

### **2. `whitelist: true`**

**Purpose:** Automatically removes properties that are **not** defined in your DTO.

**How it works:**

- When a client sends extra properties not in your DTO, they get **silently stripped**
- Only properties defined in your DTO remain

**Example:**

```typescript
// DTO definition:
class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

// Client sends:
{
  "name": "John",
  "email": "john@example.com",
  "age": 30,          // Not in DTO
  "role": "admin"     // Not in DTO
}

// With whitelist: true, the controller receives:
{
  "name": "John",
  "email": "john@example.com"
  // age and role are REMOVED
}
```

**Why use it:**

- **Security:** Prevents clients from injecting unexpected data
- **Clean data:** Ensures only expected properties reach your business logic
- **Prevents bugs:** No unexpected properties in your code

---

### **3. `forbidNonWhitelisted: true`**

**Purpose:** Instead of silently removing extra properties, **throw an error** when they exist.

**How it works:**

- When a client sends properties not in your DTO, it throws a `BadRequestException`
- Client gets a 400 error with message about invalid properties

**Example:**

```typescript
// Same DTO as above
// Client sends:
{
  "name": "John",
  "email": "john@example.com",
  "age": 30  // Not in DTO
}

// With forbidNonWhitelisted: true:
// ValidationPipe throws BadRequestException immediately
// Response: 400 Bad Request
// Message: "property age should not exist"
```

**When to use:**

- **Strict validation:** When you want clients to follow your API contract exactly
- **Debugging:** Easier to catch when clients send wrong data
- **API clarity:** Clients know exactly what properties are allowed

**Comparison:**

- `whitelist: true` → Removes extra properties silently
- `forbidNonWhitelisted: true` → Throws error on extra properties
- Often used together for maximum strictness

---

### **4. `transform: true`**

**Purpose:** Automatically transforms plain JavaScript objects into instances of your DTO classes.

**How it works:**

1. Client sends JSON (plain object)
2. ValidationPipe transforms it into an **instance** of your DTO class
3. TypeScript now recognizes the proper type

**Example:**

```typescript
// Without transform: true
@Body() body: CreateProductDto
// body is just a plain object, not an instance

// With transform: true
@Body() body: CreateProductDto
// body is now an INSTANCE of CreateProductDto class
```

**Benefits:**

- **Type safety:** Actual DTO instance instead of plain object
- **Methods work:** If your DTO has methods, they're available
- **Auto type conversion:** Strings to numbers, etc.

**Auto type conversion example:**

```typescript
class CreateProductDto {
  @IsNumber()
  price: number;
}

// Client sends: { "price": "100" } (string)
// With transform: true → price becomes 100 (number)
// Without transform: true → price remains "100" (string)
```

---

### **5. `disableErrorMessages: false`**

**Purpose:** Controls whether detailed error messages are sent to the client.

**Options:**

- `false` (default): Send detailed error messages
- `true`: Hide error messages (only status code)

**Example with `disableErrorMessages: false`:**

```json
{
  "statusCode": 400,
  "message": [
    "title must be a string",
    "title should not be empty",
    "price must be a number"
  ],
  "error": "Bad Request"
}
```

**Example with `disableErrorMessages: true`:**

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Bad Request"
}
```

**When to use `true`:**

- **Production:** Hide implementation details from clients
- **Security:** Don't expose validation rules
- **Minimal responses:** Return only essential information

**When to use `false`:**

- **Development:** Helpful for debugging
- **API consumers:** Help clients understand what's wrong

---

## **Complete Example with All Options**

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Remove extra properties
    forbidNonWhitelisted: true, // Error on extra properties
    transform: true,           // Convert to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Auto-convert types
    },
    disableErrorMessages: false, // Show detailed errors
  })
);

// DTO
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// Controller
@Post()
createProduct(@Body() createProductDto: CreateProductDto) {
  // By this point:
  // 1. Extra properties removed/error thrown
  // 2. Data validated against rules
  // 3. Plain object transformed to CreateProductDto instance
  // 4. TypeScript knows it's CreateProductDto type
  return this.service.create(createProductDto);
}
```

## **Practical Scenarios**

**Scenario 1: Client sends valid data**

```
Request: { "title": "Laptop", "price": 999 }
Result: Controller executes normally
```

**Scenario 2: Client sends extra property with forbidNonWhitelisted**

```
Request: { "title": "Laptop", "price": 999, "rating": 5 }
Result: 400 Error - "property rating should not exist"
```

**Scenario 3: Client sends invalid data**

```
Request: { "title": "", "price": -100 }
Result: 400 Error - detailed validation messages
```

**Scenario 4: Client sends string number with transform**

```
Request: { "title": "Laptop", "price": "999" }
Result: price converted to number 999, controller executes
```

## **Summary Table**

| Option                        | Purpose                   | When to Use          |
| ----------------------------- | ------------------------- | -------------------- |
| `whitelist: true`             | Remove extra properties   | Always (security)    |
| `forbidNonWhitelisted: true`  | Error on extra properties | Strict APIs          |
| `transform: true`             | Convert to DTO instances  | Always (type safety) |
| `disableErrorMessages: false` | Show detailed errors      | Development          |
| `disableErrorMessages: true`  | Hide detailed errors      | Production           |

This validation pipeline ensures that **only clean, validated data** reaches your business logic, preventing many common bugs and security issues.
**Thank you, and see you in the next lesson!**
