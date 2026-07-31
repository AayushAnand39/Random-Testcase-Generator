#include <iostream>
#include <vector>
#include <random>
#include <chrono>
#include <string>

using namespace std;

int main(int argc, char* argv[]) {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    uint64_t seed = chrono::steady_clock::now().time_since_epoch().count();
    if (argc > 1) {
        seed = stoull(argv[1]);
    }
    mt19937 rng(seed);

    auto rand_int = [&](long long l, long long r) -> long long {
        return uniform_int_distribution<long long>(l, r)(rng);
    };

    int type = rand_int(1, 7);

    int n;
    const long long MIN_VAL = -1000000000LL;
    const long long MAX_VAL = 1000000000LL;

    vector<long long> a;

    if (type == 1) {
        // Edge case: n = 1
        n = 1;
        a.push_back(rand_int(MIN_VAL, MAX_VAL));
    } else if (type == 2) {
        // All elements are strictly negative
        n = rand_int(100000, 200000);
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            a[i] = rand_int(MIN_VAL, -1);
        }
    } else if (type == 3) {
        // All elements are strictly positive
        n = rand_int(100000, 200000);
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            a[i] = rand_int(1, MAX_VAL);
        }
    } else if (type == 4) {
        // Alternating high magnitude positive and negative values
        n = 200000;
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            if (i % 2 == 0) {
                a[i] = rand_int(500000000LL, MAX_VAL);
            } else {
                a[i] = rand_int(MIN_VAL, -500000000LL);
            }
        }
    } else if (type == 5) {
        // Mostly small values with occasional extreme spikes
        n = rand_int(150000, 200000);
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            long long prob = rand_int(1, 100);
            if (prob <= 90) {
                a[i] = rand_int(-10, 10);
            } else {
                a[i] = rand_int(MIN_VAL, MAX_VAL);
            }
        }
    } else if (type == 6) {
        // Uniform random distribution over full limits
        n = 200000;
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            a[i] = rand_int(MIN_VAL, MAX_VAL);
        }
    } else {
        // Small random test case
        n = rand_int(2, 100);
        a.resize(n);
        for (int i = 0; i < n; ++i) {
            a[i] = rand_int(-1000, 1000);
        }
    }

    cout << n << "\n";
    for (int i = 0; i < n; ++i) {
        cout << a[i] << (i == n - 1 ? "" : " ");
    }
    cout << "\n";

    return 0;
}