import type {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  Query,
  Transaction,
  WhereFilterOp,
} from "firebase-admin/firestore";
import { firebaseAdmin } from "./firebaseAdmin.service";

export interface QueryOptions {
  where?: [string, WhereFilterOp, unknown];
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  startAfter?: DocumentSnapshot;
}

export interface PaginationResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null | undefined;
  hasMore: boolean;
  total?: number;
}

export interface BatchOperation<T> {
  type: "create" | "update" | "delete";
  id?: string;
  data?: Partial<T>;
}

export class FirebaseService {
  private db: Firestore;

  constructor() {
    this.db = firebaseAdmin.firestore;

    //this.configureFirestore();
  }

  private configureFirestore(): void {
    const settings: FirebaseFirestore.Settings = {
      ignoreUndefinedProperties: true,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Firestore running in development mode");
    }

    this.db.settings(settings);
  }

  /**
   *  ===== CORE CRUD OPERATION =====
   */

  async create<T extends DocumentData>(
    collectionPath: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">,
    id?: string
  ): Promise<string> {
    try {
      const docRef = id
        ? this.db.collection(collectionPath).doc(id)
        : this.db.collection(collectionPath).doc();

      const timestamp = new Date();
      const documentData = {
        ...data,
        id: docRef.id,
        createAt: timestamp,
        updatedAt: timestamp,
      };

      await docRef.set(documentData);

      return docRef.id;
    } catch (error) {
      console.error(`Firestore create error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  async update<T>(
    collectionPath: string,
    id: string,
    data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  ): Promise<void> {
    try {
      const docRef = this.db.collection(collectionPath).doc(id);

      await docRef.update({
        ...data,
        updateAt: new Date(),
      });
    } catch (error) {
      console.error(`Firestore updated error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  async delete(collectionPath: string, id: string): Promise<void> {
    try {
      await this.db.collection(collectionPath).doc(id).delete();
    } catch (error) {
      console.error(`Firestore delete error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  async getById<T>(collectionPath: string, id: string): Promise<T | null> {
    try {
      const doc = await this.db.collection(collectionPath).doc(id).get();

      if (!doc) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      console.error(`Firestore get error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   *  ===== QUERY OPERATIONS =====
   */

  async query<T>(
    collectionPath: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    try {
      let query: Query = this.db.collection(collectionPath);

      if (options.where) {
        query = query.where(...options.where);
      }

      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      const snapshot = await query.get();

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );
    } catch (error) {
      console.error(`Firestore query error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  async queryPagination<T>(
    collectionPath: string,
    options: QueryOptions & { pageSize: number },
    startAfter?: DocumentSnapshot
  ): Promise<PaginationResult<T>> {
    try {
      let query: Query = this.db.collection(collectionPath);

      if (options.where) {
        query = query.where(...options.where);
      }

      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      query = query.limit(options.pageSize + 1);

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;
      const hasMore = docs.length > options.pageSize;

      if (hasMore) {
        docs.pop();
      }

      const data = docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );

      return {
        data,
        lastDoc: hasMore ? docs[docs.length - 1] : null,
        hasMore,
      };
    } catch (error) {
      console.error(
        `Firestore paginated query error in ${collectionPath}:`,
        error
      );
      throw this.handleFirestoreError(error);
    }
  }

  async getAll<T>(collectionPath: string): Promise<T[]> {
    return this.query<T>(collectionPath);
  }

  /**
   * ===== BATCH/MULTI OPERATIONS =====
   */

  async batch<T>(operations: BatchOperation<T>[]): Promise<void> {
    const batch = this.db.batch();
    const timestamp = new Date();

    try {
      for (const operation of operations) {
        switch (operation.type) {
          case "create":
            if (!operation.data) {
              throw new Error("Create operation requires data");
            }

            const docRef = this.db.collection("temp").doc();

            batch.set(docRef, {
              ...operation.data,
              id: docRef.id,
              createdAt: timestamp,
              updatesAt: timestamp,
            });
            break;
          case "update":
            if (!operation.data || !operation.id) {
              throw new Error("Update operations requires id and data");
            }

            const updateRef = this.db.collection("temp").doc(operation.id);

            batch.update(updateRef, {
              ...operation.data,
              updateAt: timestamp,
            });
            break;
          case "delete":
            if (!operation.id) {
              throw new Error("Delete operations requires id");
            }

            const deleteRef = this.db.collection("temp").doc(operation.id);

            batch.delete(deleteRef);
            break;
        }
      }

      await batch.commit();
    } catch (error) {
      console.error("Firestore batch operation error:", error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * ===== TRANSACTION OPERATIONS =====
   */
  async runTransaction<T>(
    transactionFn: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    try {
      return await this.db.runTransaction(async (transaction) => {
        return await transactionFn(transaction);
      });
    } catch (error) {
      console.error("Firestore transaction error:", error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * ===== REAL-TIME OPERATIONS =====
   */
  subscribeToCollection<T>(
    collectionPath: string,
    callback: (docs: T[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      return this.db.collection(collectionPath).onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as T)
          );
          callback(docs);
        },
        (error) => {
          console.error(
            `Firestore subscription error in ${collectionPath}:`,
            error
          );
          onError?.(error);
        }
      );
    } catch (error) {
      console.error("Firestore subscriptions setup error:", error);
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * ===== UTILITY METHODS =====
   */

  async exists(collectionPath: string, id: string): Promise<boolean> {
    try {
      const doc = await this.db.collection(collectionPath).doc(id).get();
      return doc.exists;
    } catch(error) {
      console.error(`Firestore exists check error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  async count(collectionPath: string, conditions?: QueryOptions): Promise<number> {
    try {
      let query: Query = this.db.collection(collectionPath);

      if (conditions?.where) {
        query = query.where(...conditions.where);
      }

      const snapshot = await query.get();
      return snapshot.size;
    } catch(error) {
      console.error(`Firestore count error in ${collectionPath}:`, error);
      throw this.handleFirestoreError(error);
    }
  }

  private handleFirestoreError(error: any): Error {
    console.error("Firestore Operation Error:", error);

    if (error.code === "not-found") {
      return new Error("DOCUMENT_NOT_FOUND");
    }

    if (error.code === "permission-denied") {
      return new Error("PERMISSION_DENIED");
    }

    if (error.code === "already-exists") {
      return new Error("DOCUMENT_ALREADY_EXISTS");
    }

    return new Error(error.message || "FIRESTORE_OPERATION_FAILED");
  }

  async healthCheck(): Promise<{status: string, latency: number}> {
    const startTime = Date.now();

    try {
      await this.db.collection('_health').doc('check').get();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency
      };
    } catch(error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime
      }
    }
  }
}

export const firestoreService = new FirebaseService();