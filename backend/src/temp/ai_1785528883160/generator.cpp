#include <iostream>
#include <random>
#include <chrono>
#include <string>

using namespace std;

int main(int argc, char* argv[]) {
    unsigned int seed = chrono::steady_clock::now().time_since_epoch().count();
    if (argc > 1) {
        seed = stoi(argv[1]);
    }
    mt19937 rng(seed);

    uniform_int_distribution<int> dist(1, 100000);
    uniform_int_distribution<int> type_dist(0, 9);

    int case_type = type_dist(rng);

    int a, b;
    if (case_type == 0) {
        a = 1;
        b = 1;
    } else if (case_type == 1) {
        a = 100000;
        b = 100000;
    } else if (case_type == 2) {
        a = 1;
        b = 100000;
    } else if (case_type == 3) {
        a = 100000;
        b = 1;
    } else {
        a = dist(rng);
        b = dist(rng);
    }

    cout << a << " " << b << "\n";

    return 0;
}