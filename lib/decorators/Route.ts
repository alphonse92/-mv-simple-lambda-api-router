export default function Route(method: string, path: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function RouteDecorator(target: any, propertyKey: string): void {
    const decoredFunction = target[propertyKey];
    decoredFunction.path = path;
    decoredFunction.method = method;
    decoredFunction.controller = decoredFunction;
  };
}
