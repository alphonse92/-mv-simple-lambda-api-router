export default function Route(method, path): any {
  return function RouteDecorator(target: any, propertyKey: string, descriptor: any): void {
    const decoredFunction = target[propertyKey];
    decoredFunction.path = path;
    decoredFunction.method = method;
    decoredFunction.controller = decoredFunction;
  };
}
