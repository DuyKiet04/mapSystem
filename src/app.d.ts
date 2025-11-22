declare global {
	namespace App {
		interface PrivateEnv {
			S3_ENDPOINT: string;
			S3_ACCESS_KEY: string;
			S3_SECRET_KEY: string;
			S3_BUCKET: string;
		}
	}
}
export {};