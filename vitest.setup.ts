import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock fetch if needed
import createFetchMock from "vitest-fetch-mock";
const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();
