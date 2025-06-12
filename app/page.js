import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Ziyaarah API</h1>
        <p className="text-lg mb-6">
          API for managing Umrah and Hajj trips. This API provides endpoints
          for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Creating and managing trips</li>
          <li>Managing trip members</li>
          <li>Creating and tracking checkpoints</li>
          <li>Managing packing lists</li>
        </ul>
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Authentication</h2>
          <p>
            All API endpoints require authentication using a JWT token in the
            Authorization header:
          </p>
          <code className="block mt-2 p-2 bg-gray-200 rounded">
            Authorization: Bearer your-token-here
          </code>
        </div>
      </div>
    </main>
  );
}
