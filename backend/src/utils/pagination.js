/**
 * @fileoverview Pagination Utilities for TopchiOutpost Cafe Management System
 * 
 * This module provides cursor-based and offset-based pagination utilities
 * for efficient handling of large datasets with optimal performance.
 * 
 * @author TopchiOutpost Development Team
 * @version 1.0.0
 * @since 2025-01-01
 */

const mongoose = require('mongoose');

/**
 * Cursor-based pagination class for efficient large dataset handling
 * @description Implements cursor-based pagination for better performance with large collections
 */
class CursorPagination {
  constructor(model, options = {}) {
    this.model = model;
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.defaultSortField = options.defaultSortField || '_id';
    this.defaultSortOrder = options.defaultSortOrder || 1; // 1 for asc, -1 for desc
  }

  /**
   * Get paginated results using cursor-based pagination
   * @param {Object} query - MongoDB query object
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated results with metadata
   */
  async paginate(query = {}, options = {}) {
    try {
      const {
        limit = this.defaultLimit,
        cursor = null,
        sortField = this.defaultSortField,
        sortOrder = this.defaultSortOrder,
        populate = null,
        select = null,
      } = options;

      // Validate and sanitize limit
      const sanitizedLimit = Math.min(Math.max(parseInt(limit) || this.defaultLimit, 1), this.maxLimit);
      
      // Build sort object
      const sort = { [sortField]: sortOrder };
      
      // Build query with cursor
      let mongoQuery = { ...query };
      
      if (cursor) {
        try {
          const cursorValue = this.decodeCursor(cursor);
          const operator = sortOrder === 1 ? '$gt' : '$lt';
          mongoQuery[sortField] = { [operator]: cursorValue };
        } catch (error) {
          throw new Error('Invalid cursor provided');
        }
      }

      // Execute query
      let queryBuilder = this.model
        .find(mongoQuery)
        .sort(sort)
        .limit(sanitizedLimit + 1); // Get one extra to check if there are more results

      if (populate) {
        queryBuilder = queryBuilder.populate(populate);
      }

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }

      const results = await queryBuilder.exec();
      
      // Check if there are more results
      const hasNextPage = results.length > sanitizedLimit;
      if (hasNextPage) {
        results.pop(); // Remove the extra result
      }

      // Generate next cursor
      let nextCursor = null;
      if (hasNextPage && results.length > 0) {
        const lastResult = results[results.length - 1];
        nextCursor = this.encodeCursor(lastResult[sortField]);
      }

      return {
        data: results,
        pagination: {
          hasNextPage,
          nextCursor,
          limit: sanitizedLimit,
          sortField,
          sortOrder,
        },
      };

    } catch (error) {
      console.error('❌ Cursor pagination error:', error.message);
      throw new Error(`Pagination failed: ${error.message}`);
    }
  }

  /**
   * Encode cursor value for URL-safe transmission
   * @param {any} value - Value to encode
   * @returns {string} Encoded cursor
   */
  encodeCursor(value) {
    if (mongoose.Types.ObjectId.isValid(value)) {
      return Buffer.from(value.toString()).toString('base64');
    }
    return Buffer.from(JSON.stringify(value)).toString('base64');
  }

  /**
   * Decode cursor value from URL-safe string
   * @param {string} cursor - Encoded cursor
   * @returns {any} Decoded cursor value
   */
  decodeCursor(cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString();
      
      // Try to parse as ObjectId first
      if (mongoose.Types.ObjectId.isValid(decoded)) {
        return new mongoose.Types.ObjectId(decoded);
      }
      
      // Otherwise parse as JSON
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }
}

/**
 * Offset-based pagination class for traditional pagination
 * @description Implements offset-based pagination for simpler use cases
 */
class OffsetPagination {
  constructor(model, options = {}) {
    this.model = model;
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.defaultSortField = options.defaultSortField || '_id';
    this.defaultSortOrder = options.defaultSortOrder || 1;
  }

  /**
   * Get paginated results using offset-based pagination
   * @param {Object} query - MongoDB query object
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated results with metadata
   */
  async paginate(query = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = this.defaultLimit,
        sortField = this.defaultSortField,
        sortOrder = this.defaultSortOrder,
        populate = null,
        select = null,
      } = options;

      // Validate and sanitize inputs
      const sanitizedPage = Math.max(parseInt(page) || 1, 1);
      const sanitizedLimit = Math.min(Math.max(parseInt(limit) || this.defaultLimit, 1), this.maxLimit);
      const skip = (sanitizedPage - 1) * sanitizedLimit;

      // Build sort object
      const sort = { [sortField]: sortOrder };

      // Execute queries in parallel
      const [results, totalCount] = await Promise.all([
        this.buildQuery(query, { sort, skip, limit: sanitizedLimit, populate, select }),
        this.model.countDocuments(query)
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / sanitizedLimit);
      const hasNextPage = sanitizedPage < totalPages;
      const hasPrevPage = sanitizedPage > 1;

      return {
        data: results,
        pagination: {
          currentPage: sanitizedPage,
          totalPages,
          totalCount,
          limit: sanitizedLimit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? sanitizedPage + 1 : null,
          prevPage: hasPrevPage ? sanitizedPage - 1 : null,
        },
      };

    } catch (error) {
      console.error('❌ Offset pagination error:', error.message);
      throw new Error(`Pagination failed: ${error.message}`);
    }
  }

  /**
   * Build and execute query with options
   * @param {Object} query - MongoDB query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Query results
   */
  async buildQuery(query, options) {
    const { sort, skip, limit, populate, select } = options;
    
    let queryBuilder = this.model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }

    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    return queryBuilder.exec();
  }
}

/**
 * Aggregation pipeline pagination for complex queries
 * @description Implements pagination for MongoDB aggregation pipelines
 */
class AggregationPagination {
  constructor(model, options = {}) {
    this.model = model;
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
  }

  /**
   * Paginate aggregation pipeline results
   * @param {Array} pipeline - MongoDB aggregation pipeline
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated results with metadata
   */
  async paginate(pipeline = [], options = {}) {
    try {
      const {
        page = 1,
        limit = this.defaultLimit,
      } = options;

      // Validate and sanitize inputs
      const sanitizedPage = Math.max(parseInt(page) || 1, 1);
      const sanitizedLimit = Math.min(Math.max(parseInt(limit) || this.defaultLimit, 1), this.maxLimit);
      const skip = (sanitizedPage - 1) * sanitizedLimit;

      // Create aggregation pipeline with pagination
      const paginatedPipeline = [
        ...pipeline,
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: sanitizedLimit }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const [result] = await this.model.aggregate(paginatedPipeline);
      
      const data = result.data || [];
      const totalCount = result.totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / sanitizedLimit);
      const hasNextPage = sanitizedPage < totalPages;
      const hasPrevPage = sanitizedPage > 1;

      return {
        data,
        pagination: {
          currentPage: sanitizedPage,
          totalPages,
          totalCount,
          limit: sanitizedLimit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? sanitizedPage + 1 : null,
          prevPage: hasPrevPage ? sanitizedPage - 1 : null,
        },
      };

    } catch (error) {
      console.error('❌ Aggregation pagination error:', error.message);
      throw new Error(`Aggregation pagination failed: ${error.message}`);
    }
  }
}

/**
 * Factory function to create appropriate pagination instance
 * @param {Object} model - Mongoose model
 * @param {string} type - Pagination type ('cursor', 'offset', 'aggregation')
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination instance
 */
const createPaginator = (model, type = 'offset', options = {}) => {
  switch (type) {
    case 'cursor':
      return new CursorPagination(model, options);
    case 'aggregation':
      return new AggregationPagination(model, options);
    case 'offset':
    default:
      return new OffsetPagination(model, options);
  }
};

/**
 * Express middleware for automatic pagination
 * @param {string} type - Pagination type
 * @param {Object} options - Pagination options
 * @returns {Function} Express middleware
 */
const paginationMiddleware = (type = 'offset', options = {}) => {
  return (req, res, next) => {
    // Extract pagination parameters from query
    const paginationParams = {
      page: req.query.page,
      limit: req.query.limit,
      cursor: req.query.cursor,
      sortField: req.query.sortField,
      sortOrder: req.query.sortOrder === 'desc' ? -1 : 1,
    };

    // Attach pagination helper to request
    req.paginate = (model, query = {}, customOptions = {}) => {
      const paginator = createPaginator(model, type, { ...options, ...customOptions });
      return paginator.paginate(query, { ...paginationParams, ...customOptions });
    };

    next();
  };
};

module.exports = {
  CursorPagination,
  OffsetPagination,
  AggregationPagination,
  createPaginator,
  paginationMiddleware,
};
