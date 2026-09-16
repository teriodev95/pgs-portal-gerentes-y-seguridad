La encomienda es agregar un campo en el metodo createSale de sale.service.ts

este campo es generadaPor, que es un enum de dos valores: agente|gerente

se debe tener una funcionalidad como la del componente FormCreatePayment.vue, donde se tiene el quien pago y qoen recupero

pero en este caso solo se va a ocupar agente|gerente

analiza como hacerlo, si es que califica como un componente compartido para sacarlod e la feature y ponerlo en shared

debes colocar el componente en el formulario de creación de venta, similar a como se hace en FormCreatePayment.vue

Si consideras que se tiene una mala ux al usuario, haz esto para simplificar la interacción: 

Ahí que tenga un chancecito, me echa mano con la quincenaAl momento de diseñar la interfaz del usuario, aplica los principios que correspondan. Según tu consideración: 

# Core UI/UX Principles

1. Semantic UX Writing  
   El lenguaje, iconografía y microcopy deben comunicar intención, estado y acción de forma inequívoca.

2. Visual Affordance  
   Los elementos interactivos deben sugerir naturalmente cómo pueden utilizarse.

3. Visual Hierarchy  
   Priorizar información mediante contraste, escala, espaciado y composición.

4. Cognitive Load Reduction  
   Minimizar esfuerzo mental, ruido visual y decisiones innecesarias.

5. Systemic Consistency  
   Mantener coherencia visual, semántica e interactiva en toda la interfaz.

6. Immediate Feedback  
   Cada acción del usuario debe generar una respuesta perceptible y contextual.

7. Discoverability  
   Las funcionalidades importantes deben encontrarse intuitivamente.

8. Contextual Interaction Design  
   Mostrar únicamente información y acciones relevantes según contexto e intención.

9. Invisible Complexity  
   Ocultar complejidad técnica detrás de experiencias claras, fluidas y entendibles.

10. Operational Clarity  
    El usuario siempre debe comprender estado actual, siguiente acción y resultado esperado.