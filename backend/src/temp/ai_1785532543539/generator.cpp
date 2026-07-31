#include <iostream>
#include <random>
#include <chrono>
#include <string>

using namespace std;

int main(int argc, char* argv[]) {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    unsigned int seed = chrono::steady_clock::now().time_since_epoch().count();
    if (argc > 1) {
        seed = stoi(argv[1]);
    }
    mt19937 rng(seed);

    int mode = -1;
    if (argc > 2) {
        mode = stoi(argv[2]);
    } else {
        uniform_int_distribution<int> mode_dist(0, 9);
        mode = mode_dist(rng);
    }

    int a, b;
    uniform_int_distribution<int> dist(1, 100000);

    if (mode == 0) {
        a = 1;
        b = 1;
    } else if (mode == 1) {
        a = 100000;
        b = 100000;
    } else if (mode == 2) {
        a = 1;
        b = 100000;
    } else if (mode == 3) {
        a = 100000;
        b = 1;
    } else {
        a = dist(rng);
        b = dist(rng);
    }

    cout << a << " " << b << "\n";

    return 0;
}