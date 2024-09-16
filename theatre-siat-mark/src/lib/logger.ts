import pino, { Bindings, Logger, LoggerOptions } from "pino";

const formatters = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  level(label: string, number: number) {
    return { level: label };
  },
  bindings(bindings: Bindings) {
    return {
      pid: bindings.pid,
      hostname: bindings.hostname,
      name: bindings.name,
    };
  },
  log(object: Record<string, unknown>) {
    if (object) {
      return {
        object: JSON.stringify(object),
      };
    } else {
      return {};
    }
  },
};

export default function getLogger(name?: string): Logger<never, boolean> {
  const config: LoggerOptions = {
    level: process.env.LOG_LEVEL || "info",
    name: name,
    formatters,
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return pino(config);
}
