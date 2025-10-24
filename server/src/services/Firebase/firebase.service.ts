import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore, type Settings } from "firebase-admin/firestore";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { getStorage, type Storage } from "firebase-admin/storage";

interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL?: string;
  storageBucket?: string;
}

export class FirebaseAdminService {
  private static instance: FirebaseAdminService;
  private _auth: Auth;
  private _firestore: Firestore;
  private _storage: Storage;
  private _messaging: Messaging;
  private _isInitialized = false;

  private constructor() {
    this.initializeFirebase();
    this._auth = getAuth();
    this._firestore = getFirestore();
    this._storage = getStorage();
    this._messaging = getMessaging();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FirebaseAdminService {
    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = new FirebaseAdminService();
    }

    return FirebaseAdminService.instance;
  }

  private initializeFirebase(): void {
    if (getApps().length > 0) {
      this._isInitialized = true;
      return;
    }

    try {
      const config = this.getFirebaseConfig();

      initializeApp({
        credential: cert(config as ServiceAccount),
        databaseURL: config.databaseURL,
        storageBucket: config.storageBucket,
        projectId: config.projectId,
      });

      this._isInitialized = true;
      this._firestore = getFirestore();
      this.configureFirestore();

      console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("❌ Firebase Admin SDK initialization failed:", error);
      throw new Error("Failed to initialize Firebase Admin SDK");
    }
  }

  private getFirebaseConfig(): FirebaseConfig {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error("FIREBASE_CLIENT_EMAIL environment variable is required");
      }

      return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require("../../serviceAccountKey.json");

      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      };
    } catch {
      throw new Error(
        "Firebase Admin SDK initialization failed. " +
          "Please set FIREBASE environment variables or provide serviceAccountKey.json. " +
          "Required variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
      );
    }
  }

  private configureFirestore(): void {
    const firebaseSettings: Settings = {
      ignoreUndefinedProperties: true,
    };

    if (process.env.NODE_ENV === "development") {
      firebaseSettings.host = "localhost:8080";
      firebaseSettings.ssl = false;
    }

    this._firestore.settings(firebaseSettings);
  }

  /**
   * Public getters for Firebase services
   */
  public get auth(): Auth {
    this.ensureInitialized();
    return this._auth;
  }

  public get firestore(): Firestore {
    this.ensureInitialized();
    return this._firestore;
  }

  public get storage(): Storage {
    this.ensureInitialized();
    return this._storage;
  }

  public get messaging(): Messaging {
    this.ensureInitialized();
    return this._messaging;
  }

  /**
   * Ensure Firebase is initialized before using services
   */
  private ensureInitialized(): void {
    if (!this._isInitialized) {
      throw new Error("Firebase Admin SDK is not initialized");
    }
  }

  /**
   * Service shutdown
   */
  public async close(): Promise<void> {
    try {
      await Promise.all([this._firestore.terminate()]);
      console.log("Firebase Admin SDK connection closed");
    } catch (error) {
      console.error("Error closing Firebase connection:", error);
    }
  }

  /**
   * Utility method to check if service is initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }
}

export const firebaseAdmin = FirebaseAdminService.getInstance();
