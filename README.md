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

**Lecture Summary: Services in NestJS**

---

### **1. Introduction & Problem Statement**

- Greeting: "السلام عليهم واهلا وسهلا بكم"
- **Topic:** Services in NestJS
- **Current Problem:** All business logic is in controllers
- **Ideal Solution:** Separate business logic into services

---

### **2. Controller vs Service Responsibilities**

**Controller Responsibility:**

- Handle HTTP requests and responses
- Route incoming requests to appropriate handlers
- Return responses to clients
- **Lightweight** - minimal logic

**Service Responsibility:**

- Contain **business logic**
- Handle data operations
- Interact with data sources (database, APIs, memory)
- **Heavy logic** - complex operations

**Current Bad Practice:**

```typescript
// ProductController (BAD - mixing concerns)
@Post()
createProduct(@Body() body: CreateProductDto) {
  // Business logic should NOT be here
  const newProduct = {
    id: this.products.length + 1,
    ...body
  };
  this.products.push(newProduct);
  return newProduct;
}
```

---

### **3. Creating a Service**

**Step 1: Create service file**

- Location: `src/product/product.service.ts`
- Naming convention: `<name>.service.ts`

**Step 2: Create service class**

```typescript
// product.service.ts
export class ProductService {
  private products: ProductType[] = [
    { id: 1, title: 'Laptop', price: 400 },
    { id: 2, title: 'Phone', price: 300 },
  ];

  create(createProductDto: CreateProductDto) {
    const newProduct = {
      id: this.products.length + 1,
      ...createProductDto,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
    };
    return this.products[productIndex];
  }

  remove(id: number) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.products.splice(productIndex, 1);
    return { message: `Product with ID ${id} deleted` };
  }
}
```

---

### **4. Updated Controller (Clean Version)**

```typescript
// product.controller.ts
@Controller('api/products')
export class ProductController {
  // BAD PRACTICE (Temporary - will fix in next lesson)
  private productService = new ProductService();

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
```

---

### **5. Why This is Still Bad Practice**

**Current Approach:**

```typescript
private productService = new ProductService();  // BAD!
```

**Problems:**

1. **Tight Coupling:** Controller creates service instance directly
2. **Hard to Test:** Can't mock service for unit tests
3. **No Dependency Injection:** Manual instantiation
4. **Violates SOLID principles**

**Solution (Coming Next):** **Dependency Injection**

---

### **6. Object-Oriented Programming Relationships**

**Two Types of Class Relationships:**

**1. "Is-A" Relationship (Inheritance)**

```typescript
class Person {}
class Student extends Person {} // Student IS-A Person
```

- Inheritance (`extends`)
- Student **is a** Person
- Used for shared behavior

**2. "Has-A" Relationship (Composition)**

```typescript
class Email {}
class Account {
  private email: Email; // Account HAS-A Email
}
```

- Composition (class contains another class)
- Account **has an** Email
- Used for building complex objects

**Our Controller-Service Relationship:**

```typescript
class ProductController {
  private productService: ProductService; // ProductController HAS-A ProductService
}
```

- **"Has-A" relationship** (composition)
- Controller **has a** Service
- This is correct and proper design

---

### **7. Best Practices Summary**

**Do:**

- Keep controllers **thin** (HTTP handling only)
- Put business logic in **services**
- Services handle data operations
- Controllers delegate to services

**Don't:**

- Put business logic in controllers
- Create service instances directly in controllers
- Mix HTTP logic with business logic

**Current Status:**

- ✅ Separated concerns (controller vs service)
- ❌ Still using manual instantiation (BAD)
- ⏳ Will fix with Dependency Injection next

---

### **8. Testing the Service Approach**

**Postman Tests:**

1. `GET /api/products` - Returns all products
2. `GET /api/products/1` - Returns single product
3. `POST /api/products` - Creates new product
4. `PUT /api/products/1` - Updates product
5. `DELETE /api/products/1` - Deletes product

**Validation Still Works:**

- Empty titles → 400 Bad Request
- Negative prices → 400 Bad Request
- Invalid IDs → 404 Not Found
- Extra properties → 400 Bad Request (with `forbidNonWhitelisted`)

---

### **9. What's Next: Dependency Injection**

**Current (BAD):**

```typescript
private productService = new ProductService();  // Manual creation
```

**Next Lesson (GOOD):**

```typescript
constructor(private productService: ProductService) {}  // Dependency Injection
```

**Benefits of Dependency Injection:**

1. **Loose Coupling:** Classes don't create their dependencies
2. **Testability:** Easy to mock dependencies
3. **Reusability:** Services can be shared
4. **NestJS Built-in:** Framework manages dependencies

---

### **10. Key Takeaways**

1. **Separation of Concerns:** Controllers handle HTTP, Services handle business logic
2. **Service Creation:** Create `*.service.ts` files in module folders
3. **Business Logic:** All data operations go in services
4. **Controller Role:** Only route requests and return responses
5. **Current Limitation:** Manual service instantiation is bad practice
6. **OOP Relationships:** Controller **has a** Service (composition)
7. **Next Step:** Learn Dependency Injection to fix instantiation issue

---

**Next Lesson Preview:** We'll learn about **Dependency Injection** in NestJS to properly inject services into controllers without manual instantiation.
**Lecture Summary: Dependency Injection in NestJS**

---

## **1. Introduction to Dependency Injection (DI)**

### **Problem Statement**

- When classes directly create instances of other classes, we get **tight coupling**
- Example: If `User`, `Product`, `Order`, `Review` classes all need to send emails, each creates its own `EmailService` instance
- This leads to **code duplication**, **hard testing**, and **difficult maintenance**

### **Bad Practice Example**

```typescript
// BAD - Tight coupling
class User {
  private emailService = new EmailService(); // Direct instantiation
}

class Product {
  private emailService = new EmailService(); // Another instance
}

class Order {
  private emailService = new EmailService(); // Yet another instance
}
```

**Problems:**

- 4 separate `EmailService` instances
- Hard to mock for testing
- Changes to `EmailService` affect all classes
- Memory inefficient

---

## **2. Understanding Class Relationships**

### **Two Types of Relationships**

#### **1. "Is-A" Relationship (Inheritance)**

```typescript
class Person {}
class Student extends Person {} // Student IS-A Person
```

- **Inheritance** (`extends`)
- Used for shared behavior
- Example: `Student` **is a** `Person`

#### **2. "Has-A" Relationship (Composition)**

```typescript
class EmailService {}
class User {
  private emailService: EmailService; // User HAS-A EmailService
}
```

- **Composition** (class contains another class)
- Example: `User` **has an** `EmailService`
- This is what we use for services

---

## **3. What is Dependency Injection?**

### **Core Concept**

- **Dependency Injection** is a design pattern
- Classes **don't create** their dependencies
- Dependencies are **injected** from outside
- Creates **loose coupling** between classes

### **Before vs After DI**

**Before (BAD - Tight Coupling):**

```typescript
class User {
  private emailService = new EmailService(); // Creates dependency
}
```

**After (GOOD - Loose Coupling):**

```typescript
class User {
  constructor(private emailService: EmailService) {} // Receives dependency
}
```

---

## **4. The DI Container**

### **Concept**

- **DI Container** (or DI Container) is like a "dependency warehouse"
- Manages all service instances
- Provides dependencies when needed
- Ensures **single instance** (Singleton pattern)

### **Visualization**

```
DI Container (Warehouse)
├── EmailService (Instance 1)
├── UserService (Instance 1)
└── ProductService (Instance 1)

When UserController needs EmailService:
UserController → DI Container → "Give me EmailService" → Returns existing instance
```

**Benefits:**

- One instance shared across application
- Memory efficient
- Easy to manage
- Centralized control

---

## **5. Implementing DI in NestJS**

### **Three-Step Process**

#### **Step 1: Mark Service as Injectable**

```typescript
// product.service.ts
import { Injectable } from '@nestjs/common';

@Injectable() // THIS IS CRITICAL
export class ProductService {
  // Service logic here
}
```

- `@Injectable()` decorator tells NestJS this class can be injected
- Without this, DI won't work

#### **Step 2: Register Service in Module**

```typescript
// product.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  providers: [ProductService], // Register service here
  controllers: [ProductController],
})
export class ProductModule {}
```

- Add service to `providers` array
- This tells NestJS to manage this service

#### **Step 3: Inject Service in Controller**

```typescript
// product.controller.ts
import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  // NestJS automatically injects ProductService
}
```

**Alternative Syntax (both work):**

```typescript
// Option 1: Simplified (Recommended)
constructor(private readonly productService: ProductService) {}

// Option 2: Explicit
private readonly productService: ProductService;
constructor(productService: ProductService) {
  this.productService = productService;
}
```

---

## **6. How NestJS DI Works Internally**

### **The Magic Behind the Scenes**

1. **Request arrives** at `GET /api/products`
2. **NestJS DI Container** checks which controller handles this route
3. **Creates instance** of `ProductController`
4. **Detects** `ProductController` needs `ProductService`
5. **Checks** DI Container for `ProductService` instance
6. **If exists**: Returns existing instance (Singleton)
7. **If not exists**: Creates new instance, stores it, returns it
8. **Injects** `ProductService` into `ProductController` constructor
9. **Executes** controller method

### **Single Instance Pattern**

```typescript
// With DI:
const controller1 = new ProductController(productService); // Same instance
const controller2 = new ProductController(productService); // Same instance

// Without DI:
const controller1 = new ProductController(new ProductService()); // Different
const controller2 = new ProductController(new ProductService()); // Different
```

---

## **7. Benefits of Dependency Injection**

### **1. Loose Coupling**

- Classes don't depend on concrete implementations
- Easy to swap implementations
- Example: Switch from `EmailService` to `SmsService`

### **2. Testability**

```typescript
// Easy to mock in tests
const mockProductService = {
  findAll: jest.fn().mockReturnValue([]),
  create: jest.fn(),
};

const controller = new ProductController(mockProductService);
```

### **3. Single Responsibility**

- Each class has one job
- Services handle business logic
- Controllers handle HTTP

### **4. Code Reusability**

- Services can be injected anywhere
- No code duplication
- Consistent instances

### **5. Scalability**

- Easy to add new features
- Minimal impact on existing code
- Maintainable large applications

---

## **8. Real-World Example**

### **Without DI (Problem)**

```typescript
class EmailService {
  constructor() {
    console.log('EmailService constructor called');
  }
}

class User {
  private emailService = new EmailService();
}

class Product {
  private emailService = new EmailService();
}

// Usage:
const user = new User(); // Creates EmailService
const product = new Product(); // Creates another EmailService
// Output: "EmailService constructor called" TWICE
```

### **With DI (Solution)**

```typescript
// DI Container manages instances
class DIContainer {
  private instances = new Map();

  get(className) {
    if (!this.instances.has(className)) {
      this.instances.set(className, new className());
    }
    return this.instances.get(className);
  }
}

// Classes request dependencies
class User {
  constructor(emailService) {
    this.emailService = emailService;
  }
}

// Usage:
const container = new DIContainer();
const emailService = container.get(EmailService);
const user = new User(emailService); // Same instance
const product = new Product(emailService); // Same instance
// Output: "EmailService constructor called" ONCE
```

---

## **9. Complete NestJS Implementation**

### **Service (Injectable)**

```typescript
// product.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  private products = [{ id: 1, title: 'Laptop', price: 1000 }];

  findAll() {
    return this.products;
  }
}
```

### **Module (Provider Registration)**

```typescript
// product.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  providers: [ProductService], // Register here
  controllers: [ProductController],
})
export class ProductModule {}
```

### **Controller (Dependency Injection)**

```typescript
// product.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  // 'readonly' prevents accidental reassignment

  @Get()
  findAll() {
    return this.productService.findAll();
  }
}
```

---

## **10. Key Takeaways**

### **Golden Rules of DI in NestJS:**

1. **Mark services** with `@Injectable()`
2. **Register services** in module `providers` array
3. **Inject dependencies** via constructor
4. **Use `private readonly`** for clean syntax
5. **Let NestJS handle** instance management

### **Remember:**

- **DI Container** = Dependency warehouse
- **Singleton pattern** = One instance shared
- **Loose coupling** = Easy to test and maintain
- **NestJS automates** DI completely

### **Why DI Matters:**

- Professional NestJS development requires DI
- All major frameworks use DI
- Essential for scalable applications
- Makes testing and maintenance easier

---

**Next Steps:** Practice implementing DI in your NestJS applications. Start with simple services and gradually add more complex dependencies. **Let me explain in simple terms:**

## **The Problem Without DI:**

Imagine you have 4 friends who all need the same calculator:

- Each friend buys their **own** calculator
- If calculator needs new features, all 4 need to buy new ones
- Waste of money (4 calculators instead of 1)
- Hard to upgrade

## **The Solution With DI:**

- You buy **ONE** calculator
- Put it in a **"Calculator Box"** (DI Container)
- Friends **borrow** it when they need it
- Everyone uses the **same** calculator
- Easy to upgrade (just replace the one in the box)

## **In NestJS Terms:**

### **1. Service = Calculator**

```typescript
// Your calculator (does the work)
@Injectable()
export class ProductService {
  getProducts() {
    return ['Laptop', 'Phone'];
  }
}
```

### **2. Module = "Put in the box"**

```typescript
@Module({
  providers: [ProductService], // Put calculator in the box
})
export class ProductModule {}
```

### **3. Controller = Friend who needs calculator**

```typescript
@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService, // Borrow from box
  ) {}

  @Get()
  getProducts() {
    return this.productService.getProducts(); // Use borrowed calculator
  }
}
```

## **What Happens When User Makes Request:**

```
1. User → "Show me products" (GET /products)
2. NestJS → "Who handles this?" (Finds ProductController)
3. NestJS → "Oh, ProductController needs ProductService"
4. NestJS → Checks the "Box" (DI Container)
5. Finds ProductService → Gives it to ProductController
6. ProductController uses it → Returns products to user
```

## **Why This is Good:**

✅ **One service instance** for entire app (efficient)  
✅ **Easy to test** (can give "fake" service for testing)  
✅ **Easy to change** (replace service in one place)  
✅ **Clean code** (controller doesn't worry about creating service)

## **Simple Steps to Use DI:**

1. Add `@Injectable()` above service
2. Add service to `providers: []` in module
3. Put service in constructor of controller

## **Real Example You Already Know:**

Think of electricity in your house:

- You don't **create** electricity at home
- Power company **injects** it into your house
- You just **use** it when needed
- If electricity changes (voltage), power company handles it, not you

**DI = Power company delivering electricity to your house**

That's it! You now understand the **core idea** of Dependency Injection!

# **Complete NestJS Crash Course - What You've Learned So Far**

## **📌 PART 1: BASICS OF NESTJS**

### **1. What is NestJS?**

```
┌─────────────────────────────────────┐
│          NestJS Framework           │
│  Built on Express/Fastify + TypeScript │
│  Uses Decorators (@Get, @Post, etc.)  │
│  Follows Modular Architecture        │
└─────────────────────────────────────┘
```

**Key Features:**

- ✅ Built with TypeScript
- ✅ Uses Decorators (like Java Spring, C# .NET)
- ✅ Built on Express.js (can switch to Fastify)
- ✅ Modular architecture (like Angular)

---

## **📌 PART 2: PROJECT STRUCTURE**

### **Standard Structure:**

```
src/
├── main.ts                  # App Entry Point
├── app.module.ts           # Root Module
├── products/               # Feature Module
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dtos/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
```

---

## **📌 PART 3: MODULES - "THE ORGANIZERS"**

### **What are Modules?**

Think of them as **"Departments in a Company"**:

- Each module = One department (Products, Users, Orders)
- Each handles its own responsibilities
- Root module (`app.module`) is the "CEO"

### **Creating a Module:**

```typescript
@Module({
  controllers: [], // Handlers for this department
  providers: [], // Workers for this department
})
export class ProductsModule {}
```

### **Module Rules:**

1. Each feature gets its own module
2. Root module imports all feature modules
3. Modules can import other modules

---

## **📌 PART 4: CONTROLLERS - "THE RECEPTIONISTS"**

### **What are Controllers?**

Think of them as **"Hotel Receptionists"**:

- Handle incoming guests (HTTP requests)
- Direct them to the right place
- Don't do the actual work themselves

### **Controller with CRUD Operations:**

```typescript
@Controller('api/products') // Reception desk for products
export class ProductsController {
  @Get() // "Hello, can I help you?"
  getProducts() {
    // Directs to service
    return this.service.getProducts();
  }

  @Post() // "New guest checking in?"
  createProduct() {
    // Directs to service
    return this.service.createProduct();
  }

  // GET, POST, PUT, DELETE handle different request types
}
```

### **HTTP Methods You Learned:**

- `@Get()` - Read data
- `@Post()` - Create new data
- `@Put()` / `@Patch()` - Update data
- `@Delete()` - Remove data

---

## **📌 PART 5: SERVICES - "THE WORKERS"**

### **What are Services?**

Think of them as **"Specialized Workers"**:

- Do the actual business logic
- Handle data operations
- Don't talk to clients directly

### **Service Example:**

```typescript
@Injectable() // "I'm available for work"
export class ProductsService {
  // In-memory database (temporary)
  private products = [
    { id: 1, name: 'Laptop', price: 1000 },
    { id: 2, name: 'Phone', price: 500 },
  ];

  // Worker methods
  getAllProducts() {
    return this.products; // "Here's the data"
  }

  createProduct(data) {
    const newProduct = { id: 3, ...data };
    this.products.push(newProduct);
    return newProduct; // "I created it for you"
  }
}
```

---

## **📌 PART 6: DEPENDENCY INJECTION - "THE DELIVERY SYSTEM"**

### **The Problem & Solution:**

**OLD WAY (BAD):**

```typescript
// Controller makes its own service
class Controller {
  private service = new Service(); // "I'll build my own worker"
}
```

**Problems:** Wasteful, hard to test, tightly coupled

**NEW WAY (GOOD - DI):**

```typescript
// Controller receives service
class Controller {
  constructor(private service: Service) {} // "Give me a worker"
}
```

**Benefits:** Efficient, testable, loosely coupled

### **DI in 3 Steps:**

1. **Mark service** with `@Injectable()` ("I'm available")
2. **Register service** in module's `providers: []` ("Put me in the toolbox")
3. **Inject service** in constructor ("I need this tool")

### **DI Container Analogy:**

```
Imagine a TOOL LIBRARY:
┌─────────────────────────────────┐
│        DI CONTAINER             │
│  (Tool Library Manager)         │
│                                 │
│  Tools Available:               │
│  ├── 🔧 ProductsService         │
│  ├── 🔨 UsersService           │
│  └── ⚡ AuthService            │
└─────────────────────────────────┘

When Controller needs a tool:
1. Controller: "I need ProductsService"
2. DI Container: "Here it is!" (hands existing tool)
3. Controller uses tool, returns it when done
4. Next controller gets SAME tool (not a new one)
```

---

## **📌 PART 7: DTOs - "THE FORMS"**

### **What are DTOs?**

Think of them as **"Application Forms"**:

- Define what data is expected
- Include validation rules
- Ensure data is clean and correct

### **Create Product DTO:**

```typescript
export class CreateProductDto {
  @IsString() // Must be text
  @IsNotEmpty() // Can't be empty
  @Length(2, 100) // 2-100 characters
  name: string;

  @IsNumber() // Must be number
  @Min(0) // Can't be negative
  price: number;
}
```

### **Update Product DTO:**

```typescript
export class UpdateProductDto {
  @IsString()
  @IsOptional() // Optional for updates
  @Length(2, 100)
  name?: string; // ? = optional

  @IsNumber()
  @Min(0)
  @IsOptional() // Optional for updates
  price?: number;
}
```

---

## **📌 PART 8: VALIDATION PIPES - "THE FORM CHECKERS"**

### **What are Pipes?**

Think of them as **"Quality Control Inspectors"**:

- Check incoming data BEFORE it reaches controller
- Transform/validate data
- Reject invalid data early

### **Setup Validation:**

```typescript
// 1. Install packages:
npm install class-validator class-transformer

// 2. Add DTO validation rules (see DTOs above)

// 3. Add global validation in main.ts:
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Remove extra fields
    forbidNonWhitelisted: true, // Error on extra fields
    transform: true,            // Auto-convert types
  })
);
```

### **What Each Option Does:**

- `whitelist: true` = "Remove any fields not on the form"
- `forbidNonWhitelisted: true` = "Error if extra fields exist"
- `transform: true` = "Convert string '100' to number 100"

---

## **📌 PART 9: PIPES FOR PARAMETERS - "THE ID CHECKERS"**

### **ParseIntPipe Example:**

```typescript
@Get(':id')
getProduct(@Param('id', ParseIntPipe) id: number) {
  // id is automatically converted to number
  // If user sends "hello" → 400 Bad Request
  // If user sends "123" → becomes 123 (number)
}
```

### **Other Useful Pipes:**

- `ParseIntPipe` - String → Number
- `ParseFloatPipe` - String → Decimal
- `ParseBoolPipe` - String → Boolean
- `DefaultValuePipe` - Use default if empty

---

## **📌 PART 10: EXCEPTION HANDLING - "THE PROBLEM SOLVERS"**

### **Built-in Exceptions:**

```typescript
throw new NotFoundException('Product not found');
// Returns: 404 Not Found

throw new BadRequestException('Invalid data');
// Returns: 400 Bad Request

throw new ForbiddenException('Not allowed');
// Returns: 403 Forbidden
```

### **Automatic Error Handling:**

```
User → Invalid Request → Exception → NestJS → Proper Error Response
                                    (Auto-converts to JSON with status code)
```

---

## **📌 PART 11: REST CLIENT - "THE POSTMAN ALTERNATIVE"**

### **VS Code REST Client:**

1. Install "REST Client" extension
2. Create `.http` files
3. Write requests directly in VS Code

### **Example `.http` file:**

```http
### Get all products
GET http://localhost:3000/api/products

### Get single product
GET http://localhost:3000/api/products/1

### Create product
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "New Product",
  "price": 100
}

### Separate requests with ###
```

---

## **📌 THE COMPLETE FLOW - FROM REQUEST TO RESPONSE**

```
1. 🌐 CLIENT SENDS REQUEST
   GET http://localhost:3000/api/products/123

2. 🚪 ENTERS NESTJS
   Request goes through middleware layers

3. 📍 ROUTE MATCHING
   NestJS finds: ProductsController → @Get(':id')

4. 🔍 PARAMETER PIPE
   ParseIntPipe: "123" → 123 (number)
   If invalid ("abc") → 400 Bad Request

5. 📋 VALIDATION PIPE
   Checks DTO rules (if POST/PUT)
   If invalid → 400 Bad Request

6. 👨‍💼 CONTROLLER RECEIVES
   constructor(private service: ProductsService)
   DI Container provides service instance

7. 👷 SERVICE EXECUTES
   Business logic runs
   Returns data or throws exception

8. ⚠️ EXCEPTION HANDLING (if error)
   NestJS catches exception
   Converts to proper HTTP error

9. 📤 RESPONSE SENT
   JSON response with status code

10. 📦 CLIENT RECEIVES
    JSON data or error message
```

---

## **📌 SUMMARY OF KEY CONCEPTS**

| Concept        | Analogy      | Purpose              | Key Decorator                    |
| -------------- | ------------ | -------------------- | -------------------------------- |
| **Module**     | Department   | Organize code        | `@Module()`                      |
| **Controller** | Receptionist | Handle HTTP requests | `@Controller()`                  |
| **Service**    | Worker       | Business logic       | `@Injectable()`                  |
| **DTO**        | Form         | Define/validate data | `@IsString()`, `@IsNumber()`     |
| **Pipe**       | Inspector    | Transform/validate   | `ParseIntPipe`, `ValidationPipe` |
| **DI**         | Tool Library | Manage dependencies  | `constructor(private service)`   |

---

## **📌 WHAT YOU CAN DO NOW:**

✅ **Create a NestJS project**  
✅ **Build REST API with CRUD operations**  
✅ **Organize code into modules**  
✅ **Separate concerns (controller vs service)**  
✅ **Validate incoming data**  
✅ **Handle errors properly**  
✅ **Use Dependency Injection**  
✅ **Test APIs with REST Client**

---

## **📌 NEXT STEPS TO LEARN:**

1. **Database Integration** (TypeORM, Prisma, Mongoose)
2. **Authentication & Authorization** (JWT, Passport)
3. **File Uploads** (Multer)
4. **WebSockets** (Real-time communication)
5. **Testing** (Unit tests, E2E tests)
6. **Deployment** (Docker, AWS, Heroku)

---

## **🎯 ONE-SENTENCE SUMMARY FOR EACH CONCEPT:**

- **Module** = Department that organizes related features
- **Controller** = Receptionist that handles client requests
- **Service** = Worker that does the actual business logic
- **DTO** = Form that defines what data should look like
- **Pipe** = Inspector that checks data before processing
- **DI** = Tool library that provides services to controllers
- **Decorator** = Label that tells NestJS what something does (`@Get`, `@Post`, etc.)

---

**You now have a solid foundation in NestJS!** 🎉  
The next steps involve connecting to databases, adding authentication, and building more complex applications.

# **Complete Dependency Injection Guide - All Types Explained**

## **📌 SUMMARY OF WHAT YOU LEARNED:**

### **Three Types of Dependency Injection in NestJS:**

```
1. ✅ INTERNAL DEPENDENCY  (Same Module)
2. ✅ EXTERNAL DEPENDENCY  (Different Modules)
3. 🔄 CIRCULAR DEPENDENCY (Two Modules Depend on Each Other)
```

---

## **📌 TYPE 1: INTERNAL DEPENDENCY (EASY)**

### **Situation:**

- Service and Controller are in the **SAME module**
- Example: `ProductsService` → `ProductsController` (both in `products` module)

### **Steps (3 Simple Steps):**

#### **Step 1: Mark Service as Injectable**

```typescript
// products.service.ts
@Injectable() // ⭐ Mark as "available for injection"
export class ProductsService {}
```

#### **Step 2: Register in Module**

```typescript
// products.module.ts
@Module({
  providers: [ProductsService], // ⭐ Register here
  controllers: [ProductsController],
})
export class ProductsModule {}
```

#### **Step 3: Inject in Controller**

```typescript
// products.controller.ts
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {} // ⭐ Inject here
}
```

### **Visual:**

```
┌─────────────────────────┐
│     Products Module     │
├─────────────────────────┤
│ • ProductsService      │ ← Inside same module
│ • ProductsController   │ ← Inside same module
└─────────────────────────┘
    ↑
    Internal Dependency
    (Same module family)
```

---

## **📌 TYPE 2: EXTERNAL DEPENDENCY (MEDIUM)**

### **Situation:**

- Service in **ONE module** needs service from **ANOTHER module**
- Example: `ProductsService` needs `UsersService` (from `users` module)

### **Steps (5 Steps):**

#### **Step 1: Export Service from Source Module**

```typescript
// users.module.ts (SOURCE MODULE)
@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ⭐ EXPORT the service
})
export class UsersModule {}
```

#### **Step 2: Import Module into Target Module**

```typescript
// products.module.ts (TARGET MODULE)
@Module({
  imports: [UsersModule], // ⭐ IMPORT the module
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
```

#### **Step 3: Inject in Target Service**

```typescript
// products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    private readonly usersService: UsersService, // ⭐ Inject external service
  ) {}
}
```

### **Visual:**

```
┌─────────────────┐      ┌──────────────────┐
│  Users Module   │      │ Products Module  │
├─────────────────┤      ├──────────────────┤
│ • UsersService │─────→│ • ProductsService│
│   (EXPORTED)   │       └──────────────────┘
└─────────────────┘
        ↑
        External Dependency
        (Cross-module)
```

### **Key Points:**

- **Source module** must `export` the service
- **Target module** must `import` the module
- Then inject normally via constructor

---

## **📌 TYPE 3: CIRCULAR DEPENDENCY (COMPLEX)**

### **Situation:**

- **Two modules depend on each other**
- Example: `UsersModule` needs `ReviewsModule` AND `ReviewsModule` needs `UsersModule`
- This creates a **"chicken and egg" problem**

### **Problem Example:**

```typescript
// ❌ WON'T WORK - Circular dependency error
@Module({
  imports: [ReviewsModule], // Users imports Reviews
})
export class UsersModule {}

@Module({
  imports: [UsersModule], // Reviews imports Users (CIRCULAR!)
})
export class ReviewsModule {}
```

### **Solution: Use `forwardRef()`**

#### **Step 1: In Both Modules, Use forwardRef()**

```typescript
// users.module.ts
@Module({
  imports: [forwardRef(() => ReviewsModule)], // ⭐ Use forwardRef
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// reviews.module.ts
@Module({
  imports: [forwardRef(() => UsersModule)], // ⭐ Use forwardRef
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
```

#### **Step 2: In Services, Use @Inject(forwardRef())**

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ReviewsService)) // ⭐ Special injection
    private readonly reviewsService: ReviewsService,
  ) {}
}

// reviews.service.ts
@Injectable()
export class ReviewsService {
  constructor(
    @Inject(forwardRef(() => UsersService)) // ⭐ Special injection
    private readonly usersService: UsersService,
  ) {}
}
```

### **Visual:**

```
┌─────────────────┐      ┌──────────────────┐
│  Users Module   │──────│ Reviews Module   │
├─────────────────┤      ├──────────────────┤
│ • UsersService │←────→│ • ReviewsService │
│   needs        │      │   needs          │
│   ReviewsService│      │   UsersService   │
└─────────────────┘      └──────────────────┘
        ↖______________↙
          Circular Dependency
          (Solved with forwardRef)
```

### **Why forwardRef()?**

- Tells NestJS: "I'll tell you what this dependency is LATER"
- Breaks the circular reference at compile time
- Allows modules to reference each other

---

## **📌 QUICK COMPARISON TABLE**

| Type         | When to Use                      | Steps   | Special Notes              |
| ------------ | -------------------------------- | ------- | -------------------------- |
| **Internal** | Same module                      | 3 steps | Easiest, most common       |
| **External** | Different modules                | 5 steps | Need `export` and `import` |
| **Circular** | Two modules depend on each other | Complex | Use `forwardRef()`         |

---

## **📌 PRACTICAL EXAMPLES FROM YOUR CODE:**

### **Example 1: Internal (Products Module)**

```typescript
// ✅ ProductsService → ProductsController (SAME module)
@Module({
  providers: [ProductsService], // Register
  controllers: [ProductsController], // In same module
})
export class ProductsModule {}

@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {} // Inject
}
```

### **Example 2: External (Products needs Users)**

```typescript
// ✅ ProductsService → UsersService (DIFFERENT modules)

// 1. Export from UsersModule
@Module({
  providers: [UsersService],
  exports: [UsersService], // Export
})
export class UsersModule {}

// 2. Import in ProductsModule
@Module({
  imports: [UsersModule], // Import
  providers: [ProductsService],
})
export class ProductsModule {}

// 3. Inject in ProductsService
@Injectable()
export class ProductsService {
  constructor(private usersService: UsersService) {} // Inject
}
```

### **Example 3: Circular (Users ↔ Reviews)**

```typescript
// 🔄 UsersModule ↔ ReviewsModule (CIRCULAR)

// Users Module
@Module({
  imports: [forwardRef(() => ReviewsModule)], // forwardRef
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// Reviews Module
@Module({
  imports: [forwardRef(() => UsersModule)], // forwardRef
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

// In Services:
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ReviewsService)) // Special injection
    private reviewsService: ReviewsService,
  ) {}
}
```

---

## **📌 COMMON ERRORS & SOLUTIONS:**

### **Error 1: "Cannot resolve dependencies"**

```bash
# Error: Nest can't resolve dependencies...
```

**Solution:** Check if service is:

1. Marked with `@Injectable()`
2. Added to module's `providers: []`
3. If external: exported AND module imported

### **Error 2: Circular Dependency**

```bash
# Error: Circular dependency detected
```

**Solution:** Use `forwardRef()` in BOTH modules and services

### **Error 3: Module not found**

```bash
# Error: Module is not available
```

**Solution:** Check `imports: []` array includes the module

---

## **📌 BEST PRACTICES:**

### **DO:**

✅ Keep dependencies **internal** when possible  
✅ Use **external** for shared services (like `UsersService`)  
✅ **Avoid circular** dependencies if possible (redesign architecture)  
✅ **Test** dependencies work before adding complex logic

### **DON'T:**

❌ Create circular dependencies without `forwardRef()`  
❌ Forget to `export` services needed by other modules  
❌ Import entire modules for just one service

---

## **📌 CHEAT SHEET:**

```typescript
// ========== INTERNAL (Easy) ==========
// Module: providers: [Service]
// Controller: constructor(private service: Service)

// ========== EXTERNAL (Medium) ==========
// Source Module: exports: [Service]
// Target Module: imports: [SourceModule]
// Target Service: constructor(private service: Service)

// ========== CIRCULAR (Complex) ==========
// Module A: imports: [forwardRef(() => ModuleB)]
// Module B: imports: [forwardRef(() => ModuleA)]
// Service A: @Inject(forwardRef(() => ServiceB))
// Service B: @Inject(forwardRef(() => ServiceA))
```

---

## **📌 FINAL SUMMARY:**

### **Think of Modules as Houses:**

```
🏠 HOUSE 1 (Products Module)
├── 👨‍🍳 ProductsService (cooks products)
└── 👨‍💼 ProductsController (serves customers)

🏠 HOUSE 2 (Users Module)
├── 👩‍🍳 UsersService (cooks users)
└── 👩‍💼 UsersController (serves customers)

```

### **Three Scenarios:**

1. **Internal**: 👨‍🍳 talks to 👨‍💼 (same house, easy)
2. **External**: 👨‍🍳 borrows 👩‍🍳's recipe (different houses, needs permission)
3. **Circular**: 👨‍🍳 and 👩‍🍳 keep borrowing from each other (complex, needs special arrangement)

### **Golden Rule:**

**"Start with internal dependencies. Only go external/circular when absolutely necessary."**

---

## **🎯 WHAT TO DO NEXT:**

1. **Practice internal DI** (you already know this)
2. **Try external DI** with 2-3 modules
3. **Avoid circular** if possible (redesign instead)
4. **Use forwardRef()** only when truly needed

**You now understand ALL types of Dependency Injection in NestJS!** 🎉

# **Complete Database Integration with TypeORM in NestJS**

## **📌 SUMMARY: DATABASE CONNECTION & TYPEORM**

### **1. What You've Learned:**

You learned how to connect NestJS to a **PostgreSQL database** using **TypeORM**, an ORM (Object-Relational Mapper) that lets you write TypeScript code instead of SQL.

---

## **📌 2. THREE KEY CONCEPTS:**

### **Concept 1: TypeORM - The Translator**

```
Your TypeScript Code → TypeORM → SQL → PostgreSQL Database
                        (Translates)    (Executes)
```

### **Concept 2: Entities - The Blueprints**

```typescript
// product.entity.ts - Blueprint for database table
@Entity('products') // Maps to 'products' table
export class Product {
  @PrimaryGeneratedColumn() // Auto-increment ID
  id: number;

  @Column({ type: 'varchar', length: 150 }) // Database column
  title: string;

  @Column({ type: 'float' }) // Float type for price
  price: number;

  @CreateDateColumn() // Auto-set on create
  createdAt: Date;

  @UpdateDateColumn() // Auto-update on change
  updatedAt: Date;
}
```

### **Concept 3: Repository - The Data Manager**

```typescript
// In service - Repository handles all database operations
constructor(
  @InjectRepository(Product)  // Inject repository
  private productRepository: Repository<Product>
) {}

// Repository methods:
// .find() - Get all records
// .findOne() - Get single record
// .create() - Create new record
// .save() - Save/update record
// .remove() - Delete record
```

---

## **📌 3. STEP-BY-STEP IMPLEMENTATION:**

### **Step 1: Install Required Packages**

```bash
npm install @nestjs/typeorm typeorm pg
```

- `@nestjs/typeorm` - NestJS integration for TypeORM
- `typeorm` - The ORM itself
- `pg` - PostgreSQL driver

### **Step 2: Configure Database Connection**

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Database type
      host: 'localhost', // Database host
      port: 5432, // PostgreSQL default port
      username: 'postgres', // Your username
      password: 'your_password', // Your password
      database: 'nest_db', // Database name
      entities: [Product], // Your entities
      synchronize: true, // Auto-create tables (DANGEROUS in production!)
    }),
  ],
})
export class AppModule {}
```

**⚠️ WARNING:** `synchronize: true` is **DANGEROUS** in production as it can delete data. Use migrations instead.

### **Step 3: Create Entity**

```typescript
// product.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products') // Table name
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true }) // Optional description
  description?: string;

  @Column({ type: 'float' })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **Step 4: Configure Feature Module**

```typescript
// products.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // ⭐ Register entity
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
```

### **Step 5: Inject Repository in Service**

```typescript
// products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) // ⭐ Inject repository
    private productRepository: Repository<Product>,
  ) {}
}
```

### **Step 6: Implement CRUD Operations**

```typescript
// products.service.ts - CRUD methods
@Injectable()
export class ProductsService {
  // CREATE
  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  // READ ALL
  async findAll() {
    return await this.productRepository.find();
  }

  // READ ONE
  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // UPDATE
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id); // Reuse findOne for validation

    // Update only provided fields
    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  // DELETE
  async remove(id: number) {
    const product = await this.findOne(id); // Reuse findOne for validation
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
```

---

## **📌 4. COMPLETE WORKING EXAMPLE:**

### **Entity (product.entity.ts):**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **DTOs (Data Transfer Objects):**

```typescript
// create-product.dto.ts
export class CreateProductDto {
  @IsString()
  @Length(2, 150)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// update-product.dto.ts
export class UpdateProductDto {
  @IsString()
  @Length(2, 150)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
```

### **Service (products.service.ts):**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
```

### **Controller (products.controller.ts):**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
```

---

## **📌 5. DATABASE COLUMN DECORATORS:**

### **Common Column Decorators:**

```typescript
@PrimaryGeneratedColumn()          // Auto-increment primary key
@PrimaryColumn()                  // Manual primary key

@Column()                         // Basic column
@Column({ type: 'varchar' })      // Specify type
@Column({ length: 150 })          // Max length
@Column({ nullable: true })       // Allow NULL
@Column({ unique: true })         // Unique constraint
@Column({ default: 'default' })   // Default value

@CreateDateColumn()               // Auto-set on create
@UpdateDateColumn()               // Auto-update on change
@DeleteDateColumn()               // Soft delete
```

### **Column Types:**

```typescript
@Column({ type: 'varchar' })      // String
@Column({ type: 'text' })         // Long text
@Column({ type: 'int' })          // Integer
@Column({ type: 'float' })        // Floating point
@Column({ type: 'decimal' })      // Decimal
@Column({ type: 'boolean' })      // Boolean
@Column({ type: 'date' })         // Date
@Column({ type: 'timestamp' })    // Timestamp
@Column({ type: 'json' })         // JSON data
```

---

## **📌 6. TESTING WITH REST CLIENT:**

### **Test Requests (.http file):**

```http
### CREATE Product
POST http://localhost:3000/products
Content-Type: application/json

{
  "title": "Laptop",
  "description": "Gaming laptop with RTX 3080",
  "price": 1500
}

### GET All Products
GET http://localhost:3000/products

### GET Single Product
GET http://localhost:3000/products/1

### UPDATE Product
PUT http://localhost:3000/products/1
Content-Type: application/json

{
  "price": 1400
}

### DELETE Product
DELETE http://localhost:3000/products/1
```

---

## **📌 7. SECURITY WARNINGS:**

### **⚠️ NEVER DO THIS IN PRODUCTION:**

```typescript
// ❌ DANGEROUS - Can delete data!
synchronize: true;

// ✅ SAFER - Use migrations
synchronize: false;
```

### **⚠️ NEVER HARDCODE PASSWORDS:**

```typescript
// ❌ BAD - Password in code
password: 'mysecret123';

// ✅ GOOD - Use environment variables
password: process.env.DB_PASSWORD;
```

---

## **📌 8. COMMON ERRORS & SOLUTIONS:**

### \*\*Error: "Cannot find module 'pg'"`

```bash
# Solution: Install PostgreSQL driver
npm install pg
```

### **Error: "Connection refused"**

```bash
# Solution: Check if PostgreSQL is running
# 1. Open pgAdmin
# 2. Check connection
# 3. Verify port (default: 5432)
```

### **Error: "Role 'postgres' does not exist"**

```bash
# Solution: Create database user
# In pgAdmin: Create user/database
```

---

## **📌 9. NEXT STEPS TO LEARN:**

1. **Environment Variables** (`.env` file)
2. **Database Migrations** (Version control for database)
3. **Relationships** (One-to-Many, Many-to-Many)
4. **Query Building** (Complex queries with TypeORM)
5. **Transactions** (Multiple operations as one unit)

---

## **🎯 KEY TAKEAWAYS:**

✅ **TypeORM** translates TypeScript → SQL  
✅ **Entities** define database tables  
✅ **Repository** handles database operations  
✅ **Decorators** define column properties  
✅ **Never use** `synchronize: true` in production  
✅ **Always use** environment variables for passwords

**You now have a working database-connected NestJS application!** 🎉

<aside>
💡

# **Complete Environment Variables Guide for NestJS**

## **📋 PART 1: WHAT ARE ENVIRONMENT VARIABLES?**

### **The Problem:**

Hardcoding sensitive data in code:

```tsx
// ❌ BAD - Password in code
password: 'mysecret123',
database: 'nest_db'

```

- **Security risk** - Anyone can see your password
- **Different environments** - Development, Testing, Production need different configs
- **Team collaboration** - Everyone needs the same config

### **The Solution:**

Use `.env` files to store configuration separately from code.

---

## **📋 PART 2: STEP-BY-STEP IMPLEMENTATION**

### **Step 1: Install Required Packages**

```bash
npm install @nestjs/config

```

This package helps manage environment variables in NestJS.

### **Step 2: Create `.env` File**

```bash
# File: .env (in project root)
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=nest_db
DB_PORT=5432
DB_HOST=localhost

# Application Configuration
APP_PORT=3000
NODE_ENV=development

```

### **Step 3: Create Environment-Specific Files**

```bash
# File: .env.development (Development environment)
DB_USERNAME=postgres
DB_PASSWORD=dev_password
DB_NAME=nest_db_dev
# like :
DB_USERNAME=postgres
DB_PASSWORD=12345
DB_DATABASE=nest_db
DB_PORT=5432

# File: .env.test (Testing environment)
DB_USERNAME=postgres
DB_PASSWORD=test_password
DB_NAME=nest_db_test

# File: .env.production (Production environment)
DB_USERNAME=production_user
DB_PASSWORD=strong_production_password
DB_NAME=nest_db_prod

```

### **Step 4: Update `.gitignore`**

```
# File: .gitignore
.env
.env.development
.env.test
.env.*
!*.example.env

```

This prevents pushing sensitive data to GitHub.

### to Makes .env variables or config available everywhere in **`app.module.ts`**

```tsx
	// you need to install
	npm install @nestjs/config

    //1- in **app.module.ts**

    import { ConfigModule} from '@nestjs/config';
    // ⭐ Config Module (MUST be first)
    ConfigModule.forRoot({
      isGlobal: true,  // Makes config available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,  // Loads correct .env file
    }),

    //2. in Controller or Service use it like this
		 import { ConfigService } from '@nestjs/config';
		@Controller('api/products')
		export class ProductsController {
				    constructor(
				        private readonly config: ConfigService,
					  ) {}

					  // GET : ~/api/products
					  @Get()
					  public GetAllProducts() {
					    const sample = this.config.get<string>('SAMPLE');
					    const sample1 = process.env.SAMPLE; // not recommended in Controller, Service
					    console.log(sample, sample1);
					    return this.productsService.findAll();
					  }
		    }
```

### **Step 5: Update `app.module.ts`**

```tsx
// File: src/app.module.ts
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ⭐ Config Module (MUST be first)
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Loads correct .env file
    }),

    // TypeORM Module (now uses env variables)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-sync only in dev
      }),
      // inject: [ConfigService],
    }),

    // ... other modules
  ],
})
export class AppModule {}
```

---

## **📋 PART 3: USING ENVIRONMENT VARIABLES**

### **Method 1: Using ConfigService (Recommended)**

```tsx
// File: src/products/products.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('products')
export class ProductsController {
  constructor(private configService: ConfigService) {}

  @Get('config')
  getConfig() {
    return {
      nodeEnv: this.configService.get<string>('NODE_ENV'),
      dbName: this.configService.get<string>('DB_NAME'),
      appPort: this.configService.get<number>('APP_PORT'),
    };
  }
}
```

### **Method 2: Using process.env (Traditional)**

```tsx
// File: src/config/database.config.ts
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nest_db',
};
```

### **Method 3: Creating a Configuration Service**

```tsx
// File: src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get database() {
    return {
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
    };
  }

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }
}
```

---

## **📋 PART 4: CROSS-PLATFORM ENVIRONMENT SETUP**

### **The Problem:**

Different OS require different commands:

- **Windows:** `SET NODE_ENV=development`
- **Linux/Mac:** `export NODE_ENV=development`

```tsx
// in app.module.ts
  ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // loads .env.development , in Test it will be .env.test
  }),

  // note envFilePath => development not equal in test mode
  // because each one has it's own DB ,
  // we don't use the same database for development and production also test

 // in package.json (not working ) old way
     "start:dev": "set NODE_ENV=development && nest start --watch",

// we use a package

//1. npm install cross-env --save-dev

//2. in package.json
	// development
	"start:dev": "cross-env NODE_ENV=development  nest start --watch",
	"start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
	// production
  "start:prod": "cross-env NODE_ENV=production node dist/main",
  // testing
    "test": "cross-env NODE_ENV=test jest",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:cov": " cross-env NODE_ENV=test jest --coverage",
    "test:debug": "cross-env NODE_ENV=test node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "cross-env NODE_ENV=test jest --config ./test/jest-e2e.json"

```

### **Solution: Install cross-env**

```bash
npm install cross-env --save-dev

```

### **Update package.json scripts:**

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=development nest start",
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
    "start:prod": "cross-env NODE_ENV=production node dist/main",

    "test": "cross-env NODE_ENV=test jest",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:cov": "cross-env NODE_ENV=test jest --coverage",
    "test:debug": "cross-env NODE_ENV=test node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

---

## **📋 PART 5: VALIDATING ENVIRONMENT VARIABLES**

### **Create Validation Schema:**

```tsx
// File: src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_HOST: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsNumber()
  APP_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

### **Update ConfigModule:**

```tsx
ConfigModule.forRoot({
  validate, // Add validation
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
});
```

---

## **📋 PART 6: ORGANIZING CONFIGURATION FILES**

### **Project Structure:**

```
project/
├── .env                    # Base environment (optional)
├── .env.development       # Development environment
├── .env.test              # Testing environment
├── .env.production        # Production environment
├── .env.example           # Example file (safe to commit)
├── src/
│   ├── config/
│   │   ├── config.service.ts
│   │   ├── env.validation.ts
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   └── ...
└── package.json

```

### **Configuration Module:**

```tsx
// File: src/config/config.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { AppConfigService } from './config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class CustomConfigModule {}
```

---

## **📋 PART 7: TESTING WITH ENVIRONMENT VARIABLES**

### **Test Setup:**

```tsx
// File: test/setup.ts
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });
```

### **package.json Test Scripts:**

```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test jest",
    "test:e2e": "cross-env NODE_ENV=test jest --config ./test/jest-e2e.json",
    "test:cov": "cross-env NODE_ENV=test jest --coverage"
  },
  "jest": {
    "setupFiles": ["<rootDir>/test/setup.ts"]
  }
}
```

### **Testing Different Environments:**

```bash
# Run tests with test environment
npm run test

# Run development server
npm run start:dev

# Run production build
npm run start:prod

```

---

## **📋 PART 8: SECURITY BEST PRACTICES**

### **DO:**

✅ Use different `.env` files for each environment

✅ Add `.env*` to `.gitignore`

✅ Create `.env.example` with placeholder values

✅ Use strong passwords for production

✅ Validate environment variables

✅ Use environment-specific database instances

### **DON'T:**

❌ Commit `.env` files to version control

❌ Use the same database for development and production

❌ Store production passwords in development environment

❌ Log sensitive environment variables

❌ Hardcode any credentials in your code

---

## **📋 PART 9: COMPLETE WORKING EXAMPLE**

### **Final `app.module.ts`:**

```tsx
// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // 1. Configuration Module
    ConfigModule.forRoot({
      validate, // Validate environment variables
      isGlobal: true, // Available in all modules
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // 2. Database Module (using async configuration)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'nest_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 3. Feature Modules
    // ProductsModule,
    // UsersModule,
    // etc...
  ],
})
export class AppModule {}
```

### **Final `package.json` Scripts:**

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=development nest start",
    "start:dev": "cross-env NODE_ENV=development nest start --watch",
    "start:prod": "cross-env NODE_ENV=production node dist/main",
    "build": "nest build",
    "test": "cross-env NODE_ENV=test jest",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:cov": "cross-env NODE_ENV=test jest --coverage",
    "lint": "eslint \\"{src,apps,libs,test}/**/*.ts\\" --fix"
  }
}

```

---

## **📋 PART 10: TROUBLESHOOTING**

### **Common Issues:**

1. **"Environment variable not found"**
   - Check `.env` file exists
   - Verify variable names match
   - Restart the application
2. **"Cross-env not working"**
   - Install cross-env: `npm install cross-env --save-dev`
   - Use correct syntax in package.json
3. **"Wrong .env file loaded"**
   - Check `NODE_ENV` value
   - Verify `envFilePath` configuration
4. **"Validation errors"**
   - Check variable types in `.env` file
   - Ensure required variables are present

### **Debugging Commands:**

```bash
# Check current NODE_ENV
echo $NODE_ENV  # Linux/Mac
echo %NODE_ENV% # Windows

# List all environment variables
printenv  # Linux/Mac
set       # Windows

# Test with specific environment
cross-env NODE_ENV=test npm run start

```

---

## **🎯 KEY TAKEAWAYS:**

✅ **Use `.env` files** for sensitive configuration

✅ **Never commit** `.env` files to version control

✅ **Use `@nestjs/config`** for proper integration

✅ **Validate** environment variables

✅ **Use `cross-env`** for cross-platform compatibility

✅ **Different environments** need different configurations

✅ **ConfigService** is the recommended way to access env variables

**You now have a secure, environment-aware NestJS application!** 🎉

</aside>
