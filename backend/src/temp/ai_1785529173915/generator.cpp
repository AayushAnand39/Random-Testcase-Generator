#include <iostream>
#include <vector>
#include <numeric>
#include <random>
#include <algorithm>
#include <chrono>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());

    int type_n = uniform_int_distribution<int>(0, 99)(rng);
    int n;
    if (type_n < 25) {
        n = 200000;
    } else if (type_n < 30) {
        n = 2;
    } else if (type_n < 40) {
        n = uniform_int_distribution<int>(3, 1000)(rng);
    } else {
        n = uniform_int_distribution<int>(2, 200000)(rng);
    }

    int tree_type = uniform_int_distribution<int>(0, 4)(rng);
    vector<pair<int, int>> edges;
    edges.reserve(n - 1);

    if (tree_type == 0) {
        vector<int> p(n);
        iota(p.begin(), p.end(), 1);
        shuffle(p.begin(), p.end(), rng);
        for (int i = 0; i < n - 1; ++i) {
            edges.push_back({p[i], p[i + 1]});
        }
    } else if (tree_type == 1) {
        for (int i = 2; i <= n; ++i) {
            edges.push_back({1, i});
        }
    } else if (tree_type == 2) {
        int center = (n >= 2) ? 2 : 1;
        for (int i = 1; i <= n; ++i) {
            if (i != center) {
                edges.push_back({center, i});
            }
        }
    } else if (tree_type == 3) {
        int k = uniform_int_distribution<int>(2, 5)(rng);
        vector<int> p(n);
        iota(p.begin(), p.end(), 1);
        shuffle(p.begin(), p.end(), rng);
        for (int i = 1; i < n; ++i) {
            int parent_idx = (i - 1) / k;
            edges.push_back({p[parent_idx], p[i]});
        }
    } else {
        vector<int> p(n);
        iota(p.begin(), p.end(), 1);
        shuffle(p.begin(), p.end(), rng);
        for (int i = 1; i < n; ++i) {
            int parent_idx = uniform_int_distribution<int>(0, i - 1)(rng);
            edges.push_back({p[parent_idx], p[i]});
        }
    }

    for (auto& edge : edges) {
        if (uniform_int_distribution<int>(0, 1)(rng)) {
            swap(edge.first, edge.second);
        }
    }
    shuffle(edges.begin(), edges.end(), rng);

    cout << n << "\n";
    for (const auto& [u, v] : edges) {
        cout << u << " " << v << "\n";
    }

    return 0;
}