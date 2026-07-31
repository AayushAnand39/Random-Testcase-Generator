#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <random>
#include <chrono>

using namespace std;

struct Edge {
    int u, v;
    long long w;
};

mt19937 rng(1337); // Fixed seed for reproducibility

long long rand_range(long long l, long long r) {
    return uniform_int_distribution<long long>(l, r)(rng);
}

void print_test_case(int n, int m, const vector<Edge>& edges, int s) {
    cout << n << " " << m << "\n";
    for (const auto& e : edges) {
        cout << e.u << " " << e.v << " " << e.w << "\n";
    }
    cout << s << "\n";
}

// 1. Line graph with maximum weights ( tests integer overflow / long distance )
void gen_line_graph() {
    int n = 50000;
    int m = 50000;
    vector<Edge> edges;
    for (int i = 1; i < n; i++) {
        edges.push_back({i, i + 1, 1000000000LL});
    }
    // extra edges
    while ((int)edges.size() < m) {
        int u = rand_range(1, n);
        int v = rand_range(1, n);
        edges.push_back({u, v, 1000000000LL});
    }
    print_test_case(n, m, edges, 1);
}

// 2. Max size connected graph
void gen_max_connected() {
    int n = 100000;
    int m = 200000;
    vector<Edge> edges;
    
    // Spanning tree first to ensure connection
    for (int i = 2; i <= n; i++) {
        int p = rand_range(1, i - 1);
        edges.push_back({p, i, rand_range(1, 1000000000LL)});
    }
    // Random remaining edges
    while ((int)edges.size() < m) {
        int u = rand_range(1, n);
        int v = rand_range(1, n);
        edges.push_back({u, v, rand_range(1, 1000000000LL)});
    }
    print_test_case(n, m, edges, rand_range(1, n));
}

// 3. Graph with multiple disconnected components
void gen_disconnected() {
    int n = 20000;
    int m = 15000;
    vector<Edge> edges;
    
    // Component 1: 1..10000
    for (int i = 1; i < 10000; i++) {
        edges.push_back({i, i + 1, rand_range(1, 1000)});
    }
    // Component 2: 10001..18000
    for (int i = 10001; i < 18000; i++) {
        edges.push_back({i, i + 1, rand_range(1, 1000)});
    }
    // Extra edges within components
    while ((int)edges.size() < m) {
        if (rand_range(0, 1) == 0) {
            int u = rand_range(1, 10000);
            int v = rand_range(1, 10000);
            edges.push_back({u, v, rand_range(1, 100000)});
        } else {
            int u = rand_range(10001, 18000);
            int v = rand_range(10001, 18000);
            edges.push_back({u, v, rand_range(1, 100000)});
        }
    }
    // Vertices 18001..20000 are isolated (unreachable)
    print_test_case(n, m, edges, 1);
}

// 4. Graph with self-loops, multi-edges, and isolated source
void gen_isolated_source() {
    int n = 10000;
    int m = 15000;
    vector<Edge> edges;
    
    // All edges are between vertices 2..n, vertex 1 (source) has degree 0
    for (int i = 0; i < m; i++) {
        int u = rand_range(2, n);
        int v = rand_range(2, n);
        // allows self loop (u == v)
        edges.push_back({u, v, rand_range(1, 500000)});
    }
    print_test_case(n, m, edges, 1);
}

// 5. Small edge case graph
void gen_minimal() {
    int n = 2;
    int m = 1;
    vector<Edge> edges = {{1, 2, 5}};
    print_test_case(n, m, edges, 1);
}

// 6. Star graph
void gen_star_graph() {
    int n = 15000;
    int m = 14999;
    vector<Edge> edges;
    for (int i = 2; i <= n; i++) {
        edges.push_back({1, i, rand_range(1, 1000000000LL)});
    }
    print_test_case(n, m, edges, 1);
}

// 7. General random cases
void gen_random_case(int n, int m) {
    vector<Edge> edges;
    for (int i = 0; i < m; i++) {
        int u = rand_range(1, n);
        int v = rand_range(1, n);
        edges.push_back({u, v, rand_range(1, 1000000000LL)});
    }
    int s = rand_range(1, n);
    print_test_case(n, m, edges, s);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T = 8;
    cout << T << "\n";

    gen_minimal();
    gen_line_graph();
    gen_max_connected();
    gen_disconnected();
    gen_isolated_source();
    gen_star_graph();
    gen_random_case(1000, 2000);
    gen_random_case(5000, 10000);

    return 0;
}