// export function Activity() {
//   return (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
//       console.log(target);
//       console.log(propertyName);
//       console.log(descriptor);
//       const method = descriptor.value;

//       descriptor.value = function(...args) {
//           const result = method.apply(this, args);
//           console.log(result);
//           return result;
//       };
//   };
// }
