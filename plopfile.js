/**
 * Plop Generator for Golden Orchestrator Services
 * 
 * Usage:
 *   npm run generate
 * 
 * This will scaffold a complete service with:
 * - Service facade (singleton)
 * - Orchestrator with pipeline
 * - Operations (pure functions)
 * - Types
 * - Routes
 * - Tests (unit + integration)
 * - Prisma schema updates
 */

// @ts-nocheck
/**
 * Plop Generator Configuration
 * 
 * This file configures the service generator for the Fastify Gold Standard Starter.
 * 
 * Usage:
 *   npm run generate              - Interactive generator
 *   npm run generate:service      - Generate service directly
 *   npm run generate:operation    - Add operation to service
 *   npm run generate:route        - Generate standalone route
 * 
 * Documentation:
 *   See GENERATOR_README.md for quick start
 *   See CLI_GENERATOR_GUIDE.md for comprehensive guide
 */

export default function (plop) {
  // Helper to convert to PascalCase
  plop.setHelper('pascalCase', (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  });

  // Helper to convert to camelCase
  plop.setHelper('camelCase', (text) => {
    return text.charAt(0).toLowerCase() + text.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  });

  // Helper to convert to kebab-case
  plop.setHelper('kebabCase', (text) => {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  });

  // Service Generator
  plop.setGenerator('service', {
    description: 'Generate a new service with Golden Orchestrator pattern',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Service name (e.g., Order, User, Payment):',
        validate: (value) => {
          if (!value) return 'Service name is required';
          if (!/^[A-Z][a-zA-Z]*$/.test(value)) {
            return 'Service name must be PascalCase (e.g., OrderService, not order-service)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'operations',
        message: 'Operation names (comma-separated, e.g., validate,create,notify):',
        default: 'validate,process,finalize',
      },
      {
        type: 'confirm',
        name: 'includePrisma',
        message: 'Include Prisma model?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeRoute',
        message: 'Include API route?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include tests?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [];
      const serviceName = data.name;
      const servicePath = `src/services/{{kebabCase name}}`;
      const routePath = `src/routes/{{kebabCase name}}`;
      const operations = data.operations.split(',').map((op) => op.trim());

      // 1. Create service directory structure
      actions.push({
        type: 'add',
        path: `${servicePath}/types/index.ts`,
        templateFile: 'plop-templates/service/types.hbs',
      });

      // 2. Create operations
      operations.forEach((operation) => {
        actions.push({
          type: 'add',
          path: `${servicePath}/operations/{{kebabCase operation}}.ts`,
          templateFile: 'plop-templates/service/operation.hbs',
          data: { operation },
        });
      });

      // 3. Create orchestrator
      actions.push({
        type: 'add',
        path: `${servicePath}/orchestrator.ts`,
        templateFile: 'plop-templates/service/orchestrator.hbs',
        data: { operations },
      });

      // 4. Create service facade
      actions.push({
        type: 'add',
        path: `${servicePath}/index.ts`,
        templateFile: 'plop-templates/service/facade.hbs',
      });

      // 5. Create route (if requested)
      if (data.includeRoute) {
        actions.push({
          type: 'add',
          path: `${routePath}/index.ts`,
          templateFile: 'plop-templates/service/route.hbs',
        });
      }

      // 6. Create tests (if requested)
      if (data.includeTests) {
        // Unit tests for each operation
        operations.forEach((operation) => {
          actions.push({
            type: 'add',
            path: `${servicePath}/__tests__/operations/{{kebabCase operation}}.test.ts`,
            templateFile: 'plop-templates/service/test-operation.hbs',
            data: { operation },
          });
        });

        // Orchestrator test
        actions.push({
          type: 'add',
          path: `${servicePath}/__tests__/orchestrator.test.ts`,
          templateFile: 'plop-templates/service/test-orchestrator.hbs',
        });

        // Integration test
        actions.push({
          type: 'add',
          path: `${servicePath}/__tests__/integration.test.ts`,
          templateFile: 'plop-templates/service/test-integration.hbs',
        });
      }

      // 7. Create Prisma model (if requested)
      if (data.includePrisma) {
        actions.push({
          type: 'append',
          path: 'prisma/schema.prisma',
          pattern: /(\/\/ Add models below)/gi,
          template: '\n// {{pascalCase name}} model\nmodel {{pascalCase name}} {\n  id        String   @id @default(cuid())\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("{{kebabCase name}}")\n}\n',
        });
      }

      // 8. Auto-register route in src/app.ts
      if (data.includeRoute) {
        const kebabName = serviceName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const camelName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
        
        // Add import
        actions.push({
          type: 'modify',
          path: 'src/app.ts',
          pattern: /(import todoRoutes from '.\/routes\/todos\/index';)/g,
          template: `$1\nimport ${camelName}Routes from './routes/${kebabName}/index';`,
        });
        
        // Add registration
        actions.push({
          type: 'modify',
          path: 'src/app.ts',
          pattern: /(\/\/ Todo routes \(demonstrates Golden Orchestrator pattern\)\s+await fastify\.register\(todoRoutes, { prefix: '\/todos' }\);)/g,
          template: `$1\n\n      // ${serviceName} routes (demonstrates Golden Orchestrator pattern)\n      await fastify.register(${camelName}Routes, { prefix: '/${kebabName}' });`,
        });
      }
      
      // 9. Success message
      actions.push(() => {
        const kebabName = serviceName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        
        console.log('\n✨ Service created successfully!\n');
        console.log(`📁 Service: src/services/${kebabName}/`);
        if (data.includeRoute) {
          console.log(`🛣️  Route: src/routes/${kebabName}/`);
          console.log(`✅ Auto-registered in src/app.ts`);
        }
        if (data.includeTests) {
          console.log(`🧪 Tests: src/services/${kebabName}/__tests__/`);
        }
        
        console.log('\n📝 Next steps:\n');
        console.log('1️⃣  Implement business logic in operations/\n');
        
        if (data.includePrisma) {
          console.log('2️⃣  Run database migration:');
          console.log(`   \x1b[36mnpm run db:migrate\x1b[0m\n`);
        }
        
        console.log('3️⃣  Restart dev server (or it auto-restarts)\n');
        
        console.log('4️⃣  View in Swagger:');
        console.log(`   \x1b[36mhttp://localhost:3000/documentation\x1b[0m`);
        console.log(`   \x1b[90m(Tags auto-detected - no manual config needed!)\x1b[0m\n`);
        
        return 'Generator completed!';
      });

      return actions;
    },
  });

  // Operation Generator (add operation to existing service)
  plop.setGenerator('operation', {
    description: 'Add an operation to an existing service',
    prompts: [
      {
        type: 'input',
        name: 'service',
        message: 'Service name:',
      },
      {
        type: 'input',
        name: 'operation',
        message: 'Operation name:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/services/{{kebabCase service}}/operations/{{kebabCase operation}}.ts',
        templateFile: 'plop-templates/service/operation.hbs',
      },
      {
        type: 'add',
        path: 'src/services/{{kebabCase service}}/__tests__/operations/{{kebabCase operation}}.test.ts',
        templateFile: 'plop-templates/service/test-operation.hbs',
      },
    ],
  });

  // Route Generator (standalone)
  plop.setGenerator('route', {
    description: 'Generate a standalone route (without orchestrator)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Route name:',
      },
      {
        type: 'confirm',
        name: 'requireAuth',
        message: 'Require authentication?',
        default: true,
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/routes/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/route/index.hbs',
      },
    ],
  });
}
