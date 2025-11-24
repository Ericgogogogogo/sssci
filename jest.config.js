module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { esModuleInterop: true } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
}