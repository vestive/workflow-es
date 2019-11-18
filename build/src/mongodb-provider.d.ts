import { IPersistenceProvider, WorkflowInstance, EventSubscription, Event } from "workflow-es";
export declare class MongoDBPersistence implements IPersistenceProvider {
    connect: Promise<void>;
    private db;
    private workflowCollection;
    private subscriptionCollection;
    private eventCollection;
    private retryCount;
    constructor(connectionString: string);
    createNewWorkflow(instance: WorkflowInstance): Promise<string>;
    persistWorkflow(instance: WorkflowInstance): Promise<void>;
    getWorkflowInstance(workflowId: string): Promise<WorkflowInstance>;
    getRunnableInstances(): Promise<Array<string>>;
    createEventSubscription(subscription: EventSubscription): Promise<void>;
    getSubscriptions(eventName: string, eventKey: string, asOf: Date): Promise<Array<EventSubscription>>;
    terminateSubscription(id: string): Promise<void>;
    createEvent(event: Event): Promise<string>;
    getEvent(id: string): Promise<Event>;
    getRunnableEvents(): Promise<Array<string>>;
    markEventProcessed(id: string): Promise<void>;
    markEventUnprocessed(id: string): Promise<void>;
    getEvents(eventName: string, eventKey: any, asOf: Date): Promise<Array<string>>;
}
