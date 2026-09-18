import { ArchitectureNode, ChatMessage } from '../types';

export const INITIAL_ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway [:443]',
    type: 'gateway',
    confidence: 99.4,
    status: 'operational',
    throughput: '4,280 req/sec',
    p99Latency: '11.8 ms',
    subnet: '10.0.1.0/24 (Ingress DMZ)',
    description: 'Cloud edge reverse proxy with mTLS authentication, rate limiting, and distributed trace headers injection.',
    diagnostics: [
      'TLS 1.3 handshake negotiation: OK (0.8ms avg)',
      'Token validation cache hit ratio: 98.4%',
      'Active upstream pool health: 100% available'
    ]
  },
  {
    id: 'kafka-broker',
    name: 'Kafka Broker [Prod Cluster]',
    type: 'broker',
    confidence: 98.8,
    status: 'optimal',
    throughput: '38,400 msg/sec',
    p99Latency: '3.4 ms',
    subnet: '10.0.4.0/24 (Stream Bus)',
    description: 'Partitioned event stream broker managing telemetry ingest topics with zero data loss replication factor of 3.',
    diagnostics: [
      'Under-replicated partitions: 0',
      'Consumer lag across pool: 120ms max',
      'Disk I/O saturation: 22.4% (NVMe SSD RAID 10)'
    ]
  },
  {
    id: 'worker-pool',
    name: 'Telemetry Stream Worker Pool',
    type: 'workers',
    confidence: 97.6,
    status: 'analyzed',
    throughput: '32,150 evt/sec',
    p99Latency: '18.2 ms',
    subnet: '10.0.8.0/22 (Compute Fleet)',
    description: '12 active micro-service pods running async Rust/Tokio pipelines for real-time anomaly detection and windowed aggregation.',
    diagnostics: [
      'Active worker replicas: 12 / 12 healthy',
      'Memory utilization per pod: 340MB average',
      'Deadlock prevention backpressure: Nominal'
    ]
  },
  {
    id: 'timescaledb',
    name: 'TimescaleDB Hypertable Cluster',
    type: 'db',
    confidence: 99.1,
    status: 'optimal',
    throughput: '14,800 writes/sec',
    p99Latency: '14.1 ms',
    subnet: '10.0.16.0/24 (Persistent Storage)',
    description: 'Multi-node time-series database with automated chunk compression and continuous aggregation policies.',
    diagnostics: [
      'Continuous aggregate query time: 42ms',
      'Storage compression ratio: 8.6x',
      'Replication lag: 2ms synchronous replica'
    ]
  },
  {
    id: 'redis-ring',
    name: 'Redis Real-Time Ring [6-Shard]',
    type: 'cache',
    confidence: 99.5,
    status: 'operational',
    throughput: '89,200 ops/sec',
    p99Latency: '0.74 ms',
    subnet: '10.0.12.0/24 (In-Memory Tier)',
    description: 'Consistent-hashing distributed in-memory cache for fast session state, hot telemetry counters, and sliding window rate limits.',
    diagnostics: [
      'Cache hit ratio: 99.12%',
      'Eviction policy: volatile-lru active',
      'Cluster re-sharding health: Stable'
    ]
  }
];

export const LRU_CACHE_CODE = `/**
 * High-performance O(1) Least Recently Used (LRU) Cache in TypeScript.
 * Uses a doubly-linked list coupled with an ES6 Map for strict constant time guarantees.
 */
class DoubleNode<K, V> {
  key: K;
  value: V;
  prev: DoubleNode<K, V> | null = null;
  next: DoubleNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, DoubleNode<K, V>> = new Map();
  private head: DoubleNode<K, V>;
  private tail: DoubleNode<K, V>;

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("Capacity must be positive");
    this.capacity = capacity;
    
    // Sentinel nodes eliminate null pointer boundary checks
    this.head = new DoubleNode<K, V>(null as any, null as any);
    this.tail = new DoubleNode<K, V>(null as any, null as any);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  public get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;
    
    // Move touched node to head (most recently accessed)
    this.removeNode(node);
    this.addNodeToHead(node);
    return node.value;
  }

  public put(key: K, value: V): void {
    const existingNode = this.cache.get(key);
    
    if (existingNode) {
      existingNode.value = value;
      this.removeNode(existingNode);
      this.addNodeToHead(existingNode);
      return;
    }

    if (this.cache.size >= this.capacity) {
      // Evict least recently used (node before tail sentinel)
      const lruNode = this.tail.prev!;
      this.removeNode(lruNode);
      this.cache.delete(lruNode.key);
    }

    const newNode = new DoubleNode(key, value);
    this.cache.set(key, newNode);
    this.addNodeToHead(newNode);
  }

  private addNodeToHead(node: DoubleNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DoubleNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  public get size(): number {
    return this.cache.size;
  }
}`;

export const OPENAPI_SPEC = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Edge Telemetry Ingest Gateway API",
    "version": "2.4.0",
    "description": "Auto-extracted topology schema from multimodal architectural scanner."
  },
  "servers": [
    {
      "url": "https://ingest.telemetry.edge.internal/v2",
      "description": "Internal DMZ Ingress Gateway"
    }
  ],
  "paths": {
    "/v2/telemetry/stream": {
      "post": {
        "summary": "Ingest Batch Event Stream",
        "operationId": "ingestBatchStream",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "batchId": { "type": "string", "format": "uuid" },
                  "clusterId": { "type": "string" },
                  "timestamp": { "type": "integer" },
                  "metrics": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": { "type": "string" },
                        "value": { "type": "number" },
                        "unit": { "type": "string" }
                      }
                    }
                  }
                },
                "required": ["batchId", "metrics"]
              }
            }
          }
        },
        "responses": {
          "202": {
            "description": "Batch accepted & enqueued to Kafka stream partition",
            "headers": {
              "X-Partition-Offset": { "schema": { "type": "string" } },
              "X-Processing-Node": { "schema": { "type": "string" } }
            }
          }
        }
      }
    },
    "/v2/health/diagnostics": {
      "get": {
        "summary": "Subnet Health Diagnostics Probe",
        "responses": {
          "200": {
            "description": "All 5 cluster tiers operational"
          }
        }
      }
    }
  }
}`;

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    timestamp: '10:41 AM',
    content: 'Can you provide a clean TypeScript implementation of an LRU Cache with O(1) `get` and `put` operations, including unit test examples?'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    timestamp: '10:41 AM',
    thoughtTime: '1.2s',
    thoughts: [
      'Evaluating doubly linked list vs doubly indexed array.',
      'Constructing Map<K, DoubleNode<K, V>> for constant-time key lookups.',
      'Implementing sentinel head and tail dummy nodes to eliminate edge-case null checks.',
      'Verifying Vitest assertions against concurrent access and LRU boundary eviction.'
    ],
    content: `Here is a production-grade **LRU (Least Recently Used) Cache** implemented in TypeScript. It achieves strict **O(1)** complexity for both \`get\` and \`put\` calls by coupling an ES6 \`Map\` lookup index with an internal doubly-linked list.`,
    type: 'code',
    codeArtifact: {
      filename: 'lru_cache.ts',
      language: 'typescript',
      code: LRU_CACHE_CODE,
      testSuitePassed: true,
      testsCount: 4
    }
  },
  {
    id: 'msg-3',
    role: 'user',
    timestamp: '10:43 AM',
    content: 'Awesome! How does this compare with an LFU Cache in high-concurrency scenarios?'
  },
  {
    id: 'msg-4',
    role: 'assistant',
    timestamp: '10:44 AM',
    content: 'I synthesized our architectural conversation into an audible voice briefing summarizing cache contention, lock striping, and why LRU frequently out-scales LFU under skewed zipfian loads.',
    type: 'voice',
    voiceSession: {
      duration: '00:38',
      speaker: 'Apex-Pro (Neural)',
      model: 'Nexus Voice Engine v2.1',
      transcriptSnippet: 'In high-concurrency multi-threaded environments, LFU introduces write contention on frequency counters even during pure reads, whereas segmented or windowed LRU handles read-dominated bursts with minimal lock overhead...'
    }
  },
  {
    id: 'msg-5',
    role: 'user',
    timestamp: '10:48 AM',
    content: 'Can you run a multimodal scan on this distributed ingest architecture, extract all network ingress boundaries, and generate a validated OpenAPI route spec for the telemetry service?',
    type: 'vision-ocr',
    visionIngest: {
      filename: 'telemetry-topology-v2.png',
      size: '3.4 MB',
      status: 'Vector Ingest Complete',
      detectedNodes: INITIAL_ARCHITECTURE_NODES,
      openApiSpec: OPENAPI_SPEC
    }
  },
  {
    id: 'msg-6',
    role: 'assistant',
    timestamp: '10:48 AM',
    thoughtTime: '2.4s',
    thoughts: [
      'Ingesting high-resolution network architecture diagram.',
      'Running spatial optical character recognition and node boundary isolation.',
      'Identified 5 distributed subsystem tiers: Edge DMZ, Kafka Streaming, Worker Fleet, Storage Engine, Cache Ring.',
      'Synthesizing zero-drift OpenAPI 3.1 schema and health diagnostics probe endpoints.'
    ],
    content: `Multimodal vision scan parsed with **99.4% average node confidence**. I've extracted the discrete architectural tiers, edge ingress auth proxy, and mapped out an OpenAPI 3.1 specification for the telemetry stream ingest pipeline below.`,
    type: 'vision-ocr',
    visionIngest: {
      filename: 'telemetry-topology-v2.png',
      size: '3.4 MB',
      status: 'Active Ingest Pipeline',
      detectedNodes: INITIAL_ARCHITECTURE_NODES,
      openApiSpec: OPENAPI_SPEC
    }
  }
];
