import type { Need } from "./compare";

export const sampleOffers = `supplier,item,pack_size,unit,pack_price,current
North Market,Roma tomatoes,5,kg,18.50,true
Harbor Foods,Tomatoes roma,4,kg,13.60,false
North Market,Chicken thighs,10,kg,54.20,true
Harbor Foods,Boneless thigh,8,kg,41.60,false
North Market,Parmesan cheese,2,kg,42.10,true
Harbor Foods,Parmigiano,1.5,kg,30.75,false
North Market,Extra virgin olive oil,3,l,32.90,true
Harbor Foods,EVOO,5,l,49.50,false
North Market,Arugula,1,kg,18.30,true
Harbor Foods,Rocket leaves,1,kg,17.50,false
North Market,Lemons,5,kg,16.80,true
Harbor Foods,Lemon,4,kg,12.40,false`;

export const sampleNeeds: Need[] = [
  { item: "Roma tomatoes", quantity: 8, unit: "kg" },
  { item: "Chicken thighs", quantity: 16, unit: "kg" },
  { item: "Parmesan", quantity: 3, unit: "kg" },
  { item: "Olive oil", quantity: 6, unit: "l" },
  { item: "Arugula", quantity: 2, unit: "kg" },
  { item: "Lemons", quantity: 8, unit: "kg" },
];
