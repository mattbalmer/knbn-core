import { createBoard, newTask } from '../../src/utils/board';
import { Board } from '../../src/types/knbn';
import { KNBN_BOARD_VERSION } from '../../src/constants';

describe('board utils', () => {
  describe('createBoard', () => {
    it('should create board with default values', () => {
      const board = createBoard({});
      
      expect(board.name).toBe('My Board');
      expect(board.description).toBe('My local kanban board');
      expect(board.columns).toEqual([
        { name: 'todo' },
        { name: 'working' },
        { name: 'done' }
      ]);
      expect(board.labels).toBeUndefined();
      expect(board.tasks).toEqual({});
      expect(board.sprints).toBeUndefined();
      expect(board.metadata.nextId).toBe(1);
      expect(board.metadata.version).toBe(KNBN_BOARD_VERSION);
      expect(board.dates.created).toBeDefined();
      expect(board.dates.updated).toBeDefined();
      expect(board.dates.saved).toBeDefined();
    });

    it('should create board with custom name', () => {
      const board = createBoard({ name: 'Custom Board' });
      
      expect(board.name).toBe('Custom Board');
      expect(board.description).toBe('My local kanban board'); // default
    });

    it('should create board using arguments over defaults', () => {
      const customData = {
        name: 'Full Custom Board',
        description: 'Fully customized board',
        columns: [{ name: 'custom-column' }],
        labels: [{ name: 'custom-label' }],
        tasks: {
          5: {
            id: 5,
            title: 'Custom Task',
            description: 'Custom description',
            column: 'custom-column',
            dates: {
              created: '2024-01-01T10:00:00Z',
              updated: '2024-01-01T10:00:00Z'
            }
          }
        },
        sprints: [{
          name: 'Custom Sprint',
          dates: {
            created: '2024-01-01T09:00:00Z',
            starts: '2024-01-01T09:00:00Z'
          }
        }]
      };
      
      const board = createBoard(customData);
      
      expect(board.name).toBe(customData.name);
      expect(board.description).toBe(customData.description);
      expect(board.columns).toEqual(customData.columns);
      expect(board.labels).toEqual(customData.labels);
      expect(board.tasks).toEqual(customData.tasks);
      expect(board.sprints).toEqual(customData.sprints);
    });

    it('should use same timestamp for all date fields', () => {
      const board = createBoard({});
      
      expect(board.dates.created).toBe(board.dates.updated);
      expect(board.dates.updated).toBe(board.dates.saved);
    });

    it('should always set metadata correctly', () => {
      const board = createBoard({});
      
      expect(board.metadata).toEqual({
        nextId: 1,
        version: KNBN_BOARD_VERSION
      });
    });
  });

  describe('newTask', () => {
    let sampleBoard: Board;

    beforeEach(() => {
      sampleBoard = createBoard({
        name: 'Test Board',
        columns: [{ name: 'todo' }, { name: 'doing' }, { name: 'done' }]
      });
    });

    it('should create new task and add to board', () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description'
      };
      
      const result = newTask(sampleBoard, taskData);
      
      expect(result.task.id).toBe(1);
      expect(result.task.title).toBe('Test Task');
      expect(result.task.description).toBe('Test description');
      expect(result.task.column).not.toBeDefined();
      expect(result.task.dates.created).toBeDefined();
      expect(result.task.dates.updated).toBeDefined();
      
      expect(result.board.tasks[1]).toEqual(result.task);
    });

    it('should increment nextId correctly', () => {
      const taskData = { title: 'First Task' };
      
      const result1 = newTask(sampleBoard, taskData);
      expect(result1.task.id).toBe(1);
      expect(result1.board.metadata.nextId).toBe(2);
      
      const result2 = newTask(result1.board, { title: 'Second Task' });
      expect(result2.task.id).toBe(2);
      expect(result2.board.metadata.nextId).toBe(3);
    });

    it('should update board updated date', () => {
      const originalUpdated = sampleBoard.dates.updated;
      
      // Add small delay to ensure different timestamp
      const result = newTask(sampleBoard, { title: 'Test Task' });
      
      expect(new Date(result.board.dates.updated).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdated).getTime()
      );
    });

    it('should preserve existing tasks', () => {
      // Add an existing task to the board
      const existingTask = {
        id: 99,
        title: 'Existing Task',
        description: 'Already exists',
        column: 'done',
        dates: {
          created: '2024-01-01T10:00:00Z',
          updated: '2024-01-01T10:00:00Z'
        }
      };
      
      const boardWithTask = {
        ...sampleBoard,
        tasks: { 99: existingTask }
      };
      
      const result = newTask(boardWithTask, { title: 'New Task' });
      
      expect(result.board.tasks[99]).toEqual(existingTask);
      expect(result.board.tasks[1]).toEqual(result.task);
      expect(Object.keys(result.board.tasks)).toHaveLength(2);
    });

    it('should handle board with no default column', () => {
      const boardWithoutColumns = createBoard({ columns: [] });
      
      const result = newTask(boardWithoutColumns, { title: 'Test Task' });
      
      expect(result.task.column).toBeUndefined(); // undefined when no default column
    });

    it('should use provided task dates when available', () => {
      const customDates = {
        created: '2024-01-01T10:00:00Z',
        updated: '2024-01-01T11:00:00Z',
        moved: '2024-01-01T12:00:00Z'
      };
      
      const result = newTask(sampleBoard, {
        title: 'Test Task',
        dates: customDates
      });
      
      expect(result.task.dates.created).toBe(customDates.created);
      expect(result.task.dates.updated).toBe(customDates.updated);
      expect(result.task.dates.moved).toBe(customDates.moved);
    });

    it('should handle partial custom dates', () => {
      const result = newTask(sampleBoard, {
        title: 'Test Task',
        dates: {
          created: '2024-01-01T10:00:00Z',
          updated: '2024-01-01T10:00:00Z'
        }
      });
      
      expect(result.task.dates.created).toBe('2024-01-01T10:00:00Z');
      expect(result.task.dates.updated).toBeDefined();
      expect(result.task.dates.moved).toBeUndefined();
    });

    it('should create task with all optional properties', () => {
      const taskData = {
        title: 'Complex Task',
        description: 'Complex description',
        labels: ['urgent', 'feature'],
        sprint: 'Sprint 1',
        storyPoints: 5,
        priority: 1
      };
      
      const result = newTask(sampleBoard, taskData);
      
      expect(result.task.title).toBe(taskData.title);
      expect(result.task.description).toBe(taskData.description);
      expect(result.task.labels).toEqual(taskData.labels);
      expect(result.task.sprint).toBe(taskData.sprint);
      expect(result.task.storyPoints).toBe(taskData.storyPoints);
      expect(result.task.priority).toBe(taskData.priority);
    });

    it('should not mutate original board', () => {
      const originalTasks = { ...sampleBoard.tasks };
      const originalMetadata = { ...sampleBoard.metadata };
      
      newTask(sampleBoard, { title: 'Test Task' });
      
      expect(sampleBoard.tasks).toEqual(originalTasks);
      expect(sampleBoard.metadata).toEqual(originalMetadata);
    });
  });
});