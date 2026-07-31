#include <iostream>
#include <random>
#include <chrono>

using namespace std;

int main() {
    mt19937 rnd(chrono::steady_clock::now().time_since_epoch().count());
    
    uniform_int_distribution<int> type_dist(0, 9);
    int type = type_dist(rnd);
    
    int a, b;
    uniform_int_distribution<int> val_dist(1, 10000);
    
    if (type == 0) {
        a = 1;
        b = 1;
    } else if (type == 1) {
        a = 10000;
        b = 10000;
    } else if (type == 2) {
        a = 1;
        b = 10000;
    } else if (type == 3) {
        a = 10000;
        b = 1;
    } else {
        a = val_dist(rnd);
        b = val_dist(rnd);
    }
    
    cout << a << " " << b << "\n";
    return 0;
}