// function LogTime() {
//   return (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
//       const method = descriptor.value;
//       descriptor.value = function(...args) {
//           console.time(propertyName || 'LogTime');
//           const result = method.apply(this, args);
//           console.timeEnd(propertyName || 'LogTime');
//           return result;
//       };
//   };
// }
