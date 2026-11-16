import 'package:flutter_test/flutter_test.dart';
import 'package:pharmaconnect_mobile/app.dart';

void main() {
  testWidgets('shows PharmaConnect authentication screen', (tester) async {
    await tester.pumpWidget(const PharmaConnectApp());
    expect(find.text('PharmaConnect'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });
}
