# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KnBn Core is the foundational data layer for a kanban CLI tool. It provides business logic for board operations, file I/O, and data persistence using YAML files with .knbn extension.

## Development Commands

### Build
```bash
yarn build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

### Testing
```bash
yarn test                # Run all tests
yarn test:watch         # Run tests in watch mode
yarn test:coverage      # Run tests with coverage report
```

### Package Management
This project uses Yarn 4.9.2 as the package manager.

## Architecture

### Core Principles
- **Immutable Operations**: Functions return new objects, never mutate inputs
- **Type Safety**: Comprehensive TypeScript types with strict validation
- **File-based Storage**: YAML files (.knbn) for human-readable persistence
- **Layered Architecture**: Actions → Utils → File System

### Directory Structure
```
src/
├── actions/         # High-level business operations (public API)
├── constants/       # Application constants and versions
├── types/           # TypeScript type definitions
└── utils/           # Low-level utilities (internal helpers)
```

### Data Flow Pattern
```
CLI/MCP → Core Actions → Core Utils → File System
```

## Key Components

### Core Data Types (`types/knbn.ts`)
- **Board**: Main container with columns, tasks, labels, sprints
- **Task**: Individual work items with id, title, description, column assignment
- **Column**: Board columns for task organization
- **Label**: Categorization tags for tasks
- **Sprint**: Time-boxed work periods

### Actions Layer (`actions/`)
High-level business operations that serve as the public API:
- `board.ts`: Board creation and discovery
- `task.ts`: Task management operations
- `column.ts`: Column management
- `label.ts`: Label operations
- `sprint.ts`: Sprint management

### Utils Layer (`utils/`)
Internal helpers for low-level operations:
- `board-files.ts`: File I/O operations (save/load boards)
- `migrations.ts`: Board version migration system
- `board.ts`: Core board manipulation utilities

## Data Persistence

### File Format
- Uses YAML format with `.knbn` extension
- Human-readable and version-controlled friendly
- Supports migration between board versions (currently 0.1 → 0.2)

### Board Versioning
- Current board version: 0.2 (from package.json `boardVersion`)
- Migration system handles upgrading old board files
- Version metadata stored in `board.metadata.version`

## TypeScript Configuration

### Type Branding
Uses `ts-brand` for type-safe file paths and other branded types in `types/ts.ts`.

### Strict Configuration
- Strict TypeScript compilation enabled
- Declaration files generated for distribution
- Source maps and declaration maps included

## Testing

### Test Structure
```
tests/
├── actions/         # Tests for action layer
├── utils/          # Tests for utility layer
├── fixtures/       # Test data files
└── test-utils.ts   # Shared test utilities
```

### Test Files
- Uses Jest with ts-jest preset
- Test files follow `*.test.ts` pattern
- Coverage collection from `src/**/*.ts`

## Development Notes

### Error Handling
- Explicit error throwing with descriptive messages
- File validation and migration on load
- Version compatibility checking

### Dependencies
- `js-yaml`: YAML parsing/serialization
- `ts-brand`: TypeScript branding utilities
- Development dependencies include Jest, TypeScript, and type definitions